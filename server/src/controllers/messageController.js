const { Message, Conversation, User, Property } = require("../models");
const path = require("path");

// GET /api/messages/conversations - Get all conversations for current user
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.find({
      participants: userId
    })
      .populate("participants", "name email avatar")
      .populate("propertyId", "title images")
      .populate({
        path: "lastMessage",
        populate: {
          path: "senderId recipientId",
          select: "name email avatar"
        }
      })
      .sort({ updatedAt: -1 });

    // Format conversations for frontend
    const formattedConversations = conversations.map(conv => {
      const otherUser = conv.participants.find(
        p => p._id.toString() !== userId.toString()
      );
      
      const unreadCount = conv.unreadCount.get(userId.toString()) || 0;
      
      return {
        _id: conv._id,
        otherUser: otherUser || { name: "User" },
        property: conv.propertyId,
        propertyTitle: conv.propertyId?.title,
        lastMessage: conv.lastMessage?.text || conv.lastMessage?.voiceNote ? "Voice message" : "",
        unreadCount,
        updatedAt: conv.updatedAt
      };
    });

    res.json(formattedConversations);
  } catch (err) {
    console.error("Error fetching conversations:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /api/messages/:conversationId - Get messages for a specific conversation
exports.getMessages = async (req, res) => {
  try {
    const userId = req.user._id;
    const { conversationId } = req.params;

    // Verify user is part of conversation
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
      .populate("replyToId")
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
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// POST /api/messages - Send text message
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId, recipientId, propertyId, text, replyToId } = req.body;
    const senderId = req.user._id;

    if (!text || !recipientId || !propertyId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    let conversation;

    // Find or create conversation
    if (conversationId) {
      conversation = await Conversation.findById(conversationId);
    } else {
      conversation = await Conversation.findOne({
        participants: { $all: [senderId, recipientId] },
        propertyId
      });

      if (!conversation) {
        conversation = await Conversation.create({
          participants: [senderId, recipientId],
          propertyId,
          unreadCount: new Map()
        });
      }
    }

    // Create message
    const message = await Message.create({
      conversationId: conversation._id,
      senderId,
      recipientId,
      text,
      replyToId: replyToId || null,
      seen: false
    });

    // Update conversation
    conversation.lastMessage = message._id;
    const currentUnread = conversation.unreadCount.get(recipientId.toString()) || 0;
    conversation.unreadCount.set(recipientId.toString(), currentUnread + 1);
    await conversation.save();

    const populatedMessage = await Message.findById(message._id)
      .populate("senderId", "name email avatar")
      .populate("recipientId", "name email avatar")
      .populate("replyToId");

    // Emit real-time event for new message
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${recipientId}`).emit('new_message', {
        message: populatedMessage,
        conversationId: conversation._id
      });
    }

    res.status(201).json(populatedMessage);
  } catch (err) {
    console.error("Error sending message:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// POST /api/messages/voice - Send voice note
exports.sendVoiceNote = async (req, res) => {
  try {
    const { conversationId, recipientId, propertyId, replyToId } = req.body;
    const senderId = req.user._id;

    if (!req.file || !recipientId || !propertyId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    let conversation;

    // Find or create conversation
    if (conversationId) {
      conversation = await Conversation.findById(conversationId);
    } else {
      conversation = await Conversation.findOne({
        participants: { $all: [senderId, recipientId] },
        propertyId
      });

      if (!conversation) {
        conversation = await Conversation.create({
          participants: [senderId, recipientId],
          propertyId,
          unreadCount: new Map()
        });
      }
    }

    // Create message with voice note
    const message = await Message.create({
      conversationId: conversation._id,
      senderId,
      recipientId,
      text: null,
      voiceNote: `/uploads/voice-notes/${req.file.filename}`,
      replyToId: replyToId || null,
      seen: false
    });

    // Update conversation
    conversation.lastMessage = message._id;
    const currentUnread = conversation.unreadCount.get(recipientId.toString()) || 0;
    conversation.unreadCount.set(recipientId.toString(), currentUnread + 1);
    await conversation.save();

    const populatedMessage = await Message.findById(message._id)
      .populate("senderId", "name email avatar")
      .populate("recipientId", "name email avatar")
      .populate("replyToId");

    // Emit real-time event for new voice note
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${recipientId}`).emit('new_message', {
        message: populatedMessage,
        conversationId: conversation._id
      });
    }

    res.status(201).json(populatedMessage);
  } catch (err) {
    console.error("Error sending voice note:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// PUT /api/messages/:id/seen - Mark message as seen
exports.markAsSeen = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Only recipient can mark as seen
    if (message.recipientId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    message.seen = true;
    message.seenAt = new Date();
    await message.save();

    // Emit real-time event for message seen
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${message.senderId}`).emit('message_seen', {
        messageId: message._id,
        conversationId: message.conversationId,
        seenAt: message.seenAt
      });
    }

    res.json({ message: "Marked as seen" });
  } catch (err) {
    console.error("Error marking message as seen:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /api/messages/unread-count - Get total unread count
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.find({
      participants: userId
    });

    let totalUnread = 0;
    conversations.forEach(conv => {
      totalUnread += conv.unreadCount.get(userId.toString()) || 0;
    });

    res.json({ unreadCount: totalUnread });
  } catch (err) {
    console.error("Error fetching unread count:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
