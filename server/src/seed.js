const mongoose = require("mongoose");
const connectDB = require("./config/db");
const User = require("./models/User");
const Property = require("./models/Property");
const bcrypt = require("bcryptjs");

const seedData = async () => {
    try {
        await connectDB();

        // Clear existing data
        await User.deleteMany();
        await Property.deleteMany();

        // Create a demo landlord
        const hashedPassword = await bcrypt.hash("password123", 10);
        const landlord = await User.create({
            name: "Demo Landlord",
            email: "landlord@inzu.com",
            password: hashedPassword,
            role: "landlord",
        });

        // Create some initial properties
        const sampleProperties = [
            {
                title: "Kigali Modern Apartment",
                price: 1500,
                district: "Nyarugenge",
                sector: "Kiyovu",
                type: "rent",
                description: "A beautiful top-floor apartment with a view of the city skyline.",
                landlord: landlord._id,
            },
            {
                title: "Lake Side Villa",
                price: 250000,
                district: "Rubavu",
                sector: "Gisenyi",
                type: "buy",
                description: "Luxurious villa right at the shore of Lake Kivu.",
                landlord: landlord._id,
            }
        ];

        await Property.insertMany(sampleProperties);

        console.log("✅ Database seeded with initial data!");
        process.exit();
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
};

seedData();
