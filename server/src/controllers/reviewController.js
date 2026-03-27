const Review = require('../models/Review');
const Property = require('../models/Property');
const User = require('../models/User');

// Create a new review
exports.createReview = async (req, res) => {
  try {
    const { propertyId, rating, comment } = req.body;
    const userId = req.user.id;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5 stars' });
    }

    // Check if property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Get user name
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user already reviewed this property
    const existingReview = await Review.findOne({ propertyId, userId });
    if (existingReview) {
      return res.status(400).json({ 
        message: 'You have already reviewed this property. Use PUT to update your review.' 
      });
    }

    // Create review
    const review = new Review({
      propertyId,
      userId,
      userName: user.name,
      rating,
      comment: comment || ''
    });

    await review.save();

    // Update property average rating
    await updatePropertyRating(propertyId);

    res.status(201).json({ review });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update an existing review
exports.updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    // Validate rating
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5 stars' });
    }

    // Find review
    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user owns this review
    if (review.userId.toString() !== userId) {
      return res.status(403).json({ message: 'You can only update your own reviews' });
    }

    // Update review
    if (rating) review.rating = rating;
    if (comment !== undefined) review.comment = comment;

    await review.save();

    // Update property average rating
    await updatePropertyRating(review.propertyId);

    res.json({ review });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all reviews for a property
exports.getPropertyReviews = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if property exists
    const property = await Property.findById(id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Get all reviews for this property
    const reviews = await Review.find({ propertyId: id })
      .sort({ createdAt: -1 });

    // Calculate average rating and total reviews
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
      : 0;

    res.json({
      reviews,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      totalReviews
    });
  } catch (error) {
    console.error('Error fetching property reviews:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all reviews by a user
exports.getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;

    const reviews = await Review.find({ userId })
      .populate('propertyId', 'title location price images')
      .sort({ createdAt: -1 });

    res.json({ reviews });
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to update property rating
async function updatePropertyRating(propertyId) {
  try {
    const reviews = await Review.find({ propertyId });
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
      : 0;

    await Property.findByIdAndUpdate(propertyId, {
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews
    });
  } catch (error) {
    console.error('Error updating property rating:', error);
  }
}
