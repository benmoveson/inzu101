const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { Message, Conversation } = require("../models");
const messageController = require("../controllers/messageController");
const multer = require("multer");
const path = require("path");

// Configure multer for voice note uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/voice-notes/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'voice-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// New enhanced endpoints
router.get("/conversations", auth, messageController.getConversations);
router.get("/unread-count", auth, messageController.getUnreadCount);
router.post("/voice", auth, upload.single('audio'), messageController.sendVoiceNote);
router.put("/:id/seen", auth, messageController.markAsSeen);

// Legacy endpoints for backward compatibility
// GET /api/messages - Get all conversations for current user (legacy)
router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all messages where user is sender or receiver and not deleted for this user
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }],
      deletedFor: { $ne: userId }
    })
      .populate("sender", "name email avatar")
      .populate("receiver", "name email avatar")
      .populate("property", "title images")
      .sort({ createdAt: -1 });

    // Group messages by conversation (other user + property)
    const conversationsMap = new Map();

    messages.forEach(msg => {
      const otherUserId = msg.sender._id.toString() === userId.toString() 
        ? msg.receiver._id.toString() 
        : msg.sender._id.toString();
      
      const conversationKey = `${otherUserId}-${msg.property._id}`;

      if (!conversationsMap.has(conversationKey)) {
        conversationsMap.set(conversationKey, {
          _id: conversationKey,
          otherUser: msg.sender._id.toString() === userId.toString() ? msg.receiver : msg.sender,
          property: msg.property,
          lastMessage: msg.text,
          updatedAt: msg.createdAt,
          unreadCount: 0,
          messages: []
        });
      }

      conversationsMap.get(conversationKey).messages.push(msg);
    });

    const conversations = Array.from(conversationsMap.values());

    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// POST /api/messages - Send a new message
router.post("/", auth, async (req, res) => {
  try {
    const { text, receiverId, propertyId, replyTo, conversationId, recipientId, replyToId } = req.body;

    // Support both old and new field names
    const finalRecipientId = recipientId || receiverId;
    const finalReplyToId = replyToId || replyTo;

    console.log('Received message request:', { 
      text: text?.substring(0, 20), 
      finalRecipientId, 
      propertyId, 
      conversationId,
      senderId: req.user._id 
    });

    if (!text || !finalRecipientId || !propertyId) {
      console.error('Missing required fields:', { text: !!text, finalRecipientId: !!finalRecipientId, propertyId: !!propertyId });
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Use new controller logic
    const senderId = req.user._id;
    let conversation;

    // Find or create conversation
    if (conversationId) {
      console.log('Finding existing conversation:', conversationId);
      conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        console.error('Conversation not found:', conversationId);
        return res.status(404).json({ message: "Conversation not found" });
      }
    } else {
      console.log('Looking for or creating conversation with:', { senderId, finalRecipientId, propertyId });
      
      // Try to find existing conversation (check both orderings of participants)
      conversation = await Conversation.findOne({
        $or: [
          { participants: [senderId, finalRecipientId], propertyId },
          { participants: [finalRecipientId, senderId], propertyId }
        ]
      });

      if (!conversation) {
        console.log('Creating new conversation');
        try {
          conversation = await Conversation.create({
            participants: [senderId, finalRecipientId],
            propertyId,
            unreadCount: new Map()
          });
          console.log('Created conversation:', conversation._id);
        } catch (createErr) {
          // If duplicate key error, try to find the conversation again
          if (createErr.code === 11000) {
            console.log('Duplicate key error, finding existing conversation');
            conversation = await Conversation.findOne({
              $or: [
                { participants: [senderId, finalRecipientId], propertyId },
                { participants: [finalRecipientId, senderId], propertyId }
              ]
            });
            if (!conversation) {
              throw createErr; // Re-throw if still not found
            }
            console.log('Found conversation after duplicate error:', conversation._id);
          } else {
            throw createErr;
          }
        }
      } else {
        console.log('Found existing conversation:', conversation._id);
      }
    }

    // Create message
    console.log('Creating message');
    const message = await Message.create({
      conversationId: conversation._id,
      senderId,
      recipientId: finalRecipientId,
      text,
      replyToId: finalReplyToId || null,
      seen: false,
      // Legacy fields for backward compatibility
      sender: senderId,
      receiver: finalRecipientId,
      property: propertyId,
      replyTo: finalReplyToId || null
    });
    console.log('Created message:', message._id);

    // Update conversation
    conversation.lastMessage = message._id;
    const currentUnread = conversation.unreadCount.get(finalRecipientId.toString()) || 0;
    conversation.unreadCount.set(finalRecipientId.toString(), currentUnread + 1);
    await conversation.save();

    const populatedMessage = await Message.findById(message._id)
      .populate("senderId", "name email avatar")
      .populate("recipientId", "name email avatar")
      .populate("sender", "name email avatar")
      .populate("receiver", "name email avatar")
      .populate("property", "title images")
      .populate("replyToId")
      .populate("replyTo");

    // Emit real-time event for new message
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${finalRecipientId}`).emit('new_message', {
        message: populatedMessage,
        conversationId: conversation._id
      });
    }

    console.log('Message sent successfully');
    res.status(201).json(populatedMessage);
  } catch (err) {
    console.error("Error sending message:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// POST /api/messages/voice - Send a voice note (legacy endpoint, redirects to new one)
router.post("/voice-legacy", auth, upload.single('audio'), async (req, res) => {
  try {
    const { receiverId, propertyId, replyTo, conversationId } = req.body;

    if (!req.file || !receiverId || !propertyId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const senderId = req.user._id;
    let conversation;

    // Find or create conversation
    if (conversationId) {
      conversation = await Conversation.findById(conversationId);
    } else {
      conversation = await Conversation.findOne({
        participants: { $all: [senderId, receiverId] },
        propertyId
      });

      if (!conversation) {
        conversation = await Conversation.create({
          participants: [senderId, receiverId],
          propertyId,
          unreadCount: new Map()
        });
      }
    }

    const message = await Message.create({
      conversationId: conversation._id,
      senderId,
      recipientId: receiverId,
      text: null,
      voiceNote: `/uploads/voice-notes/${req.file.filename}`,
      replyToId: replyTo || null,
      seen: false,
      // Legacy fields
      sender: senderId,
      receiver: receiverId,
      property: propertyId,
      replyTo: replyTo || null
    });

    // Update conversation
    conversation.lastMessage = message._id;
    const currentUnread = conversation.unreadCount.get(receiverId.toString()) || 0;
    conversation.unreadCount.set(receiverId.toString(), currentUnread + 1);
    await conversation.save();

    const populatedMessage = await Message.findById(message._id)
      .populate("senderId", "name email avatar")
      .populate("recipientId", "name email avatar")
      .populate("sender", "name email avatar")
      .populate("receiver", "name email avatar")
      .populate("property", "title images")
      .populate("replyToId")
      .populate("replyTo");

    res.status(201).json(populatedMessage);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// DELETE /api/messages/:id - Delete a message (unsend)
// Updated route order to fix 404 issue
router.delete("/:id", auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Check both senderId and sender fields for compatibility
    const messageSenderId = message.senderId || message.sender;
    if (!messageSenderId || messageSenderId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this message" });
    }

    // Mark as unsent instead of deleting
    message.isUnsent = true;
    await message.save();

    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "name email avatar")
      .populate("receiver", "name email avatar")
      .populate("senderId", "name email avatar")
      .populate("recipientId", "name email avatar");

    res.json(populatedMessage);
  } catch (err) {
    console.error("Error deleting message:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// POST /api/messages/:id/react - Add reaction to message
router.post("/:id/react", auth, async (req, res) => {
  try {
    const { emoji } = req.body;
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    message.reaction = emoji;
    await message.save();

    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "name email")
      .populate("receiver", "name email");

    res.json(populatedMessage);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// DELETE /api/messages/conversation/:conversationId - Delete conversation for current user
// This route must come before GET /:conversationId to avoid 404
router.delete("/conversation/:conversationId", auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { conversationId } = req.params;

    // Parse conversationId (format: otherUserId-propertyId)
    const [otherUserId, propertyId] = conversationId.split("-");

    // Mark all messages in this conversation as deleted for this user
    await Message.updateMany(
      {
        property: propertyId,
        $or: [
          { sender: userId, receiver: otherUserId },
          { sender: otherUserId, receiver: userId }
        ]
      },
      {
        $addToSet: { deletedFor: userId }
      }
    );

    res.json({ message: "Conversation deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET /api/messages/:conversationId - Get messages for a specific conversation
router.get("/:conversationId", auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { conversationId } = req.params;

    // Check if it's a new-style conversation ID (MongoDB ObjectId) or old-style (userId-propertyId)
    const isOldStyle = conversationId.includes("-");

    if (isOldStyle) {
      // Legacy format: otherUserId-propertyId
      const [otherUserId, propertyId] = conversationId.split("-");

      const messages = await Message.find({
        property: propertyId,
        $or: [
          { sender: userId, receiver: otherUserId },
          { sender: otherUserId, receiver: userId }
        ],
        deletedFor: { $ne: userId }
      })
        .populate("sender", "name email avatar")
        .populate("receiver", "name email avatar")
        .populate("senderId", "name email avatar")
        .populate("recipientId", "name email avatar")
        .populate("replyTo")
        .populate("replyToId")
        .sort({ createdAt: 1 });

      res.json(messages);
    } else {
      // New format: Conversation ObjectId
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }

      if (!conversation.participants.some(p => p.toString() === userId.toString())) {
        return res.status(403).json({ message: "Not authorized" });
      }

      const messages = await Message.find({
        conversationId,
        deletedFor: { $ne: userId }
      })
        .populate("senderId", "name email avatar")
        .populate("recipientId", "name email avatar")
        .populate("sender", "name email avatar")
        .populate("receiver", "name email avatar")
        .populate("replyToId")
        .populate("replyTo")
        .sort({ createdAt: 1 });

      // Mark messages as seen
      await Message.updateMany(
        {
          conversationId,
          recipientId: userId,
          seen: false
        },
        {
          $set: { seen: true, seenAt: new Date() }
        }
      );

      // Reset unread count for this user
      conversation.unreadCount.set(userId.toString(), 0);
      await conversation.save();

      res.json(messages);
    }
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
