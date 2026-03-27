const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const auth = require('../middleware/auth');

// Create a new review (authenticated)
router.post('/', auth, reviewController.createReview);

// Update a review (authenticated)
router.put('/:id', auth, reviewController.updateReview);

// Get all reviews for a property (public)
router.get('/property/:id', reviewController.getPropertyReviews);

// Get all reviews by a user (public)
router.get('/user/:userId', reviewController.getUserReviews);

module.exports = router;
