const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error("❌ MONGODB_URI is not defined in .env");
      process.exit(1);
    }

    const maskedUri = uri.replace(/\/\/.*@/, "//****:****@");
    console.log(`📡 Attempting to connect to MongoDB: ${maskedUri}`);

    const conn = await mongoose.connect(uri, { family: 4 });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    if (error.message.includes('ECONNREFUSED')) {
      console.error("💡 Tip: This often means your IP is not whitelisted in MongoDB Atlas or there's a DNS issue.");
    }
    process.exit(1);
  }
};

module.exports = connectDB;
