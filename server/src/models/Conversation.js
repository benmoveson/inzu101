const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    participants: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }],
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    unreadCount: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
conversationSchema.index({ participants: 1 });
conversationSchema.index({ propertyId: 1 });
conversationSchema.index({ updatedAt: -1 });

// Compound index for finding conversations by participants and property
conversationSchema.index({ participants: 1, propertyId: 1 }, { unique: true });

module.exports = mongoose.model("Conversation", conversationSchema);
