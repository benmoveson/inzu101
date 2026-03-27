const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} = require("../controllers/notificationController");

// All routes require authentication
router.use(auth);

// POST /api/notifications - Create new notification (internal use)
router.post("/", createNotification);

// GET /api/notifications - Get user's notifications
router.get("/", getUserNotifications);

// PUT /api/notifications/read-all - Mark all notifications as read
router.put("/read-all", markAllNotificationsAsRead);

// PUT /api/notifications/:id/read - Mark notification as read
router.put("/:id/read", markNotificationAsRead);

// DELETE /api/notifications/:id - Delete notification
router.delete("/:id", deleteNotification);

module.exports = router;
