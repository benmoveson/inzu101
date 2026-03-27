const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { Property } = require("../models");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const cloudinary = require("cloudinary").v2;
const { notifyNewListing } = require("../utils/notificationService");

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer setup (memory storage)
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { files: 5 } });

// POST /api/properties
router.post("/", auth, upload.array("images", 5), async (req, res) => {
  try {
    const user = req.user;

    // if (user.role !== "landlord")
    //   return res
    //     .status(403)
    //     .json({ message: "Only landlords can post properties" });

    // Check free listing limit (1 free listing)
    const freeListingsUsed = user.free_listings_used || 0;
    // if (freeListingsUsed >= 1) {
    //   return res.status(403).json({ message: "Free listing limit reached" });
    // }

    const {
      title,
      price,
      district,
      sector,
      location,
      bedrooms,
      bathrooms,
      latitude,
      longitude,
      type,
      description,
      listingType,
      rentPeriod,
      amenities,
    } = req.body;

    console.log('Received amenities:', amenities);
    console.log('Type of amenities:', typeof amenities);

    // Parse amenities if it's a string
    let parsedAmenities = amenities;
    if (typeof amenities === 'string') {
      try {
        parsedAmenities = JSON.parse(amenities);
        console.log('Parsed amenities:', parsedAmenities);
      } catch (e) {
        console.error('Failed to parse amenities:', e);
        parsedAmenities = {};
      }
    }

    // Convert string numbers to actual numbers for counts
    if (parsedAmenities && typeof parsedAmenities === 'object') {
      if (parsedAmenities.bedrooms && parsedAmenities.bedrooms.count) {
        parsedAmenities.bedrooms.count = Number(parsedAmenities.bedrooms.count);
      }
      if (parsedAmenities.bathrooms && parsedAmenities.bathrooms.count) {
        parsedAmenities.bathrooms.count = Number(parsedAmenities.bathrooms.count);
      }
      console.log('Processed amenities with number conversion:', parsedAmenities);
    }

    // Validate required fields
    if (!title || !price || !type || !description)
      return res.status(400).json({ message: "Missing required fields" });

    // Upload images to Cloudinary
    const files = req.files;
    const imageUrls = [];

    if (files && files.length > 0) {
      const uploadPromises = files.map((file) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "properties", public_id: uuidv4() },
            (error, result) => {
              if (error) reject(error);
              else resolve({ url: result.secure_url, public_id: result.public_id });
            }
          );
          stream.end(file.buffer);
        });
      });

      const uploadedImages = await Promise.all(uploadPromises);
      imageUrls.push(...uploadedImages);
    }

    // Create property
    const property = await Property.create({
      landlord: user._id,
      title,
      price: Number(price),
      listingType: listingType || 'rent',
      rentPeriod: rentPeriod || 'month',
      district: district || 'Kigali',
      sector,
      location,
      latitude: latitude ? Number(latitude) : null,
      longitude: longitude ? Number(longitude) : null,
      type,
      description,
      amenities: parsedAmenities,
      images: imageUrls,
    });

    console.log('Property created successfully with amenities:', property.amenities);

    // Increment user's free listings
    user.free_listings_used = freeListingsUsed + 1;
    await user.save();

    // Notify users about new listing (async, don't wait)
    // In a real implementation, this would find users with saved searches
    // that match this property's criteria
    notifyNewListing(property, []).catch(err => 
      console.error("Error sending new listing notifications:", err)
    );

    // Emit real-time event for new property
    const io = req.app.get('io');
    if (io) {
      io.emit('new_property', property);
    }

    res
      .status(201)
      .json({ message: "Property created successfully", property });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET /api/properties with filtering, pagination, and geolocation
router.get("/", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      location,
      district,
      minPrice,
      maxPrice,
      type,
      bedrooms,
      bathrooms,
      furnished,
      petFriendly,
      latitude,
      longitude,
      category,
      listingType
    } = req.query;

    // Build filter query
    const filter = {};

    if (location) {
      filter.$or = [
        { location: { $regex: location, $options: 'i' } },
        { district: { $regex: location, $options: 'i' } },
        { sector: { $regex: location, $options: 'i' } }
      ];
    }

    // Add district filter for "Near me" functionality
    if (district) {
      filter.district = { $regex: district, $options: 'i' };
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (type) {
      filter.type = type.toLowerCase();
    }

    if (category) {
      filter.category = category.toLowerCase();
    }

    if (listingType) {
      filter.listingType = listingType.toLowerCase();
    }

    if (bedrooms) {
      filter.bedrooms = { $gte: Number(bedrooms) };
    }

    if (bathrooms) {
      filter.bathrooms = { $gte: Number(bathrooms) };
    }

    // Fetch properties
    const skip = (Number(page) - 1) * Number(limit);
    let properties = await Property.find(filter)
      .populate("landlord", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    // If geolocation provided, sort by distance
    if (latitude && longitude) {
      const userLat = Number(latitude);
      const userLng = Number(longitude);

      properties = properties
        .filter(p => p.latitude && p.longitude)
        .map(p => {
          // Calculate distance using Haversine formula
          const R = 6371; // Earth's radius in km
          const dLat = (p.latitude - userLat) * Math.PI / 180;
          const dLng = (p.longitude - userLng) * Math.PI / 180;
          const a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(userLat * Math.PI / 180) * Math.cos(p.latitude * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const distance = R * c;

          return { ...p.toObject(), distance };
        })
        .sort((a, b) => a.distance - b.distance);
    }

    // Check if there are more properties
    const total = await Property.countDocuments(filter);
    const hasMore = skip + properties.length < total;

    res.json({ properties, hasMore, total });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET /api/properties/user - Get current user's properties
router.get("/user", auth, async (req, res) => {
  try {
    const properties = await Property.find({ landlord: req.user._id })
      .sort({ createdAt: -1 });
    res.json(properties);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET /api/properties/:id
router.get("/:id", async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate("landlord", "name email phone");
    if (!property) return res.status(404).json({ message: "Property not found" });
    res.json(property);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// DELETE /api/properties/:id
router.delete("/:id", auth, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Check if user owns the property
    if (property.landlord.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this property" });
    }

    // Delete images from Cloudinary
    if (property.images && property.images.length > 0) {
      const deletePromises = property.images.map(img => {
        if (img.public_id) {
          return cloudinary.uploader.destroy(img.public_id);
        }
      });
      await Promise.all(deletePromises);
    }

    await Property.findByIdAndDelete(req.params.id);
    res.json({ message: "Property deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// PUT /api/properties/:id - Update property
router.put("/:id", auth, upload.array("images", 5), async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Check if user owns the property
    if (property.landlord.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this property" });
    }

    const {
      title,
      price,
      district,
      sector,
      location,
      latitude,
      longitude,
      type,
      description,
      listingType,
      rentPeriod,
      amenities,
    } = req.body;

    // Parse amenities if it's a string
    let parsedAmenities = amenities;
    if (typeof amenities === 'string') {
      try {
        parsedAmenities = JSON.parse(amenities);
      } catch (e) {
        console.error('Failed to parse amenities:', e);
        parsedAmenities = property.amenities; // Keep existing amenities if parse fails
      }
    }

    // Convert string numbers to actual numbers for counts
    if (parsedAmenities && typeof parsedAmenities === 'object') {
      if (parsedAmenities.bedrooms && parsedAmenities.bedrooms.count) {
        parsedAmenities.bedrooms.count = Number(parsedAmenities.bedrooms.count);
      }
      if (parsedAmenities.bathrooms && parsedAmenities.bathrooms.count) {
        parsedAmenities.bathrooms.count = Number(parsedAmenities.bathrooms.count);
      }
    }

    // Upload new images if provided
    const files = req.files;
    let newImageUrls = [];

    if (files && files.length > 0) {
      const uploadPromises = files.map((file) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "properties", public_id: uuidv4() },
            (error, result) => {
              if (error) reject(error);
              else resolve({ url: result.secure_url, public_id: result.public_id });
            }
          );
          stream.end(file.buffer);
        });
      });

      newImageUrls = await Promise.all(uploadPromises);
    }

    // Update property fields
    if (title) property.title = title;
    if (price) property.price = Number(price);
    if (listingType) property.listingType = listingType;
    if (rentPeriod) property.rentPeriod = rentPeriod;
    if (district) property.district = district;
    if (sector) property.sector = sector;
    if (location) property.location = location;
    if (latitude) property.latitude = Number(latitude);
    if (longitude) property.longitude = Number(longitude);
    if (type) property.type = type;
    if (description) property.description = description;
    if (parsedAmenities) property.amenities = parsedAmenities;
    if (newImageUrls.length > 0) {
      property.images = [...property.images, ...newImageUrls];
    }

    await property.save();

    // Emit real-time event for property update
    const io = req.app.get('io');
    if (io) {
      io.emit('property_updated', property);
    }

    res.json({ message: "Property updated successfully", property });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
