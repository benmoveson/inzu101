const { Inquiry, Property, User } = require("../models");
const { notifyInquiryReply } = require("../utils/notificationService");

// @desc    Create a new inquiry
// @route   POST /api/inquiries
// @access  Private
exports.createInquiry = async (req, res) => {
  try {
    const { propertyId, name, email, phone, message } = req.body;

    // Validate required fields
    if (!propertyId || !name || !email || !phone || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Verify property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Create inquiry
    const inquiry = await Inquiry.create({
      propertyId,
      userId: req.user._id,
      name,
      email,
      phone,
      message,
    });

    // Populate property and user details
    await inquiry.populate("propertyId", "title location price");
    await inquiry.populate("userId", "name email");

    // TODO: Send notification to property owner
    // This would typically involve:
    // 1. Finding the property owner
    // 2. Creating a notification record
    // 3. Sending an email/SMS to the owner
    // For now, we'll just log it
    console.log(`New inquiry for property ${property.title} from ${name}`);

    res.status(201).json({
      message: "Inquiry sent successfully",
      inquiry,
    });
  } catch (error) {
    console.error("Error creating inquiry:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get user's inquiry history
// @route   GET /api/inquiries
// @access  Private
exports.getUserInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find({ userId: req.user._id })
      .populate("propertyId", "title location price images")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: inquiries.length,
      inquiries,
    });
  } catch (error) {
    console.error("Error fetching inquiries:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get inquiry by ID
// @route   GET /api/inquiries/:id
// @access  Private
exports.getInquiryById = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id)
      .populate("propertyId", "title location price images")
      .populate("userId", "name email phone");

    if (!inquiry) {
      return res.status(404).json({ message: "Inquiry not found" });
    }

    // Ensure user can only access their own inquiries
    if (inquiry.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.status(200).json(inquiry);
  } catch (error) {
    console.error("Error fetching inquiry:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update inquiry status
// @route   PUT /api/inquiries/:id
// @access  Private
exports.updateInquiryStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["pending", "replied", "closed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const inquiry = await Inquiry.findById(req.params.id)
      .populate("propertyId", "title");

    if (!inquiry) {
      return res.status(404).json({ message: "Inquiry not found" });
    }

    // Only the inquiry owner can update status
    if (inquiry.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    const previousStatus = inquiry.status;
    inquiry.status = status;
    await inquiry.save();

    // Send notification if status changed to "replied"
    if (status === "replied" && previousStatus !== "replied") {
      notifyInquiryReply(
        inquiry.userId.toString(),
        inquiry,
        inquiry.propertyId.title
      ).catch(err => 
        console.error("Error sending inquiry reply notification:", err)
      );
    }

    res.status(200).json({
      message: "Inquiry status updated",
      inquiry,
    });
  } catch (error) {
    console.error("Error updating inquiry:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
