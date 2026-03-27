const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./src/config/db");

// Routes
const authRoutes = require("./src/routes/auth");
const propertyRoutes = require("./src/routes/properties");
const userRoutes = require("./src/routes/userRoutes");
const favoritesRoutes = require("./src/routes/favorites");
const inquiryRoutes = require("./src/routes/inquiries");
const notificationRoutes = require("./src/routes/notifications");
const messagesRoutes = require("./src/routes/messages");
const reviewRoutes = require("./src/routes/reviews");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Make io accessible to routes
app.set('io', io);

// Serve static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount Routes
app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/users", userRoutes);
app.use("/api/favorites", favoritesRoutes);
app.use("/api/inquiries", inquiryRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/reviews", reviewRoutes);

// Test endpoint
app.get("/", (req, res) => res.send("INZUU API Running with MongoDB Atlas!"));

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Handle authentication
  socket.on('authenticate', (userId) => {
    socket.userId = userId;
    socket.join(`user:${userId}`);
    console.log(`User ${userId} authenticated and joined room`);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start server
const startServer = async () => {
  try {
    await connectDB(); // connect to MongoDB Atlas

    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (err) {
    console.error("CRITICAL ERROR: Failed to start server!");
    console.error("Error Name:", err.name);
    console.error("Error Message:", err.message);
    console.error("Stack Trace:", err.stack);
    process.exit(1);
  }
};

startServer();
