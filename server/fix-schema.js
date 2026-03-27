const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const mongoose = require("mongoose");

async function fixSchema() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Drop the properties collection to reset the schema
    await mongoose.connection.db.dropCollection("properties");
    console.log("✅ Dropped properties collection");

    console.log("✅ Schema fixed! You can now create properties with the new amenities structure.");
    
    process.exit(0);
  } catch (err) {
    if (err.message.includes("ns not found")) {
      console.log("✅ Properties collection doesn't exist yet - no need to drop it");
      process.exit(0);
    }
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

fixSchema();
