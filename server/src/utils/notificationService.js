const { Notification, User } = require("../models");

/**
 * Create a notification for a user
 * @param {Object} notificationData - Notification data
 * @param {String} notificationData.userId - User ID to notify
 * @param {String} notificationData.type - Notification type (new_listing, inquiry_reply)
 * @param {String} notificationData.title - Notification title
 * @param {String} notificationData.message - Notification message
 * @param {String} notificationData.relatedId - Related entity ID (property or inquiry)
 * @returns {Promise<Object>} Created notification
 */
const createNotification = async (notificationData) => {
  try {
    const { userId, type, title, message, relatedId } = notificationData;

    // Check if user has notifications enabled
    const user = await User.findById(userId);
    if (!user) {
      console.log(`User ${userId} not found, skipping notification`);
      return null;
    }

    // Create notification in database
    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      relatedId,
    });

    // Send push notification if user has notifications enabled
    if (user.preferences?.notifications) {
      await sendPushNotification(user, notification);
    }

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

/**
 * Send push notification to user
 * @param {Object} user - User object
 * @param {Object} notification - Notification object
 */
const sendPushNotification = async (user, notification) => {
  try {
    // TODO: Implement actual push notification sending
    // This would integrate with services like:
    // - Firebase Cloud Messaging (FCM)
    // - Apple Push Notification Service (APNS)
    // - Web Push API
    
    console.log(`Push notification sent to user ${user._id}:`, {
      title: notification.title,
      message: notification.message,
      type: notification.type,
    });

    // For now, just log the notification
    // In production, you would:
    // 1. Get user's device tokens from database
    // 2. Send notification via push service
    // 3. Handle delivery failures and retries
  } catch (error) {
    console.error("Error sending push notification:", error);
    // Don't throw error - push notification failure shouldn't break the flow
  }
};

/**
 * Notify users about a new property listing that matches their saved searches
 * @param {Object} property - Property object
 * @param {Array} matchingUsers - Array of user IDs who should be notified
 */
const notifyNewListing = async (property, matchingUsers = []) => {
  try {
    const notifications = matchingUsers.map((userId) =>
      createNotification({
        userId,
        type: "new_listing",
        title: "New Property Available",
        message: `A new ${property.type} in ${property.location} matches your search criteria`,
        relatedId: property._id,
      })
    );

    await Promise.all(notifications);
    console.log(`Notified ${matchingUsers.length} users about new listing`);
  } catch (error) {
    console.error("Error notifying users about new listing:", error);
  }
};

/**
 * Notify user about an inquiry reply
 * @param {String} userId - User ID to notify
 * @param {Object} inquiry - Inquiry object
 * @param {String} propertyTitle - Property title
 */
const notifyInquiryReply = async (userId, inquiry, propertyTitle) => {
  try {
    await createNotification({
      userId,
      type: "inquiry_reply",
      title: "Inquiry Reply Received",
      message: `You received a reply to your inquiry about ${propertyTitle}`,
      relatedId: inquiry._id,
    });

    console.log(`Notified user ${userId} about inquiry reply`);
  } catch (error) {
    console.error("Error notifying user about inquiry reply:", error);
  }
};

module.exports = {
  createNotification,
  notifyNewListing,
  notifyInquiryReply,
};
