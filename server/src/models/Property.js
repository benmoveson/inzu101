const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    listingType: {
      type: String,
      enum: ["rent", "sale"],
      default: "rent",
      required: true,
    },
    rentPeriod: {
      type: String,
      enum: ["month", "night"],
      default: "month",
    },
    district: {
      type: String,
      required: true,
    },
    sector: {
      type: String,
    },
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },
    type: {
      type: String,
      enum: ["house", "room", "apartment", "hotel"],
      required: true,
    },
    location: String, // City/Area name
    description: {
      type: String,
      required: true,
    },
    amenities: {
      type: {
        bedrooms: {
          count: { type: Number },
          size: { type: String }, // e.g., "12m²", "15m²"
        },
        bathrooms: {
          count: { type: Number },
          type: { type: String }, // "full", "half", "shared", "private"
        },
        kitchen: {
          available: { type: Boolean },
          equipped: { type: Boolean }, // stove, oven, fridge, dishwasher
        },
        heating: { type: Boolean },
        airConditioning: { type: Boolean },
        internet: { type: Boolean },
        water: { type: Boolean },
        electricity: { type: Boolean },
        laundry: { type: Boolean },
      },
      default: {},
    },
    landlord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    images: [
      {
        url: String,
        public_id: String,
      },
    ],
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalReviews: {
      type: Number,
      default: 0,
      min: 0
    },
    roomDescriptions: [
      {
        type: {
          type: String,
          enum: ['bedroom', 'bathroom', 'kitchen', 'living room', 'other'],
          required: true
        },
        description: {
          type: String,
          required: true
        }
      }
    ]
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Property", propertySchema);
