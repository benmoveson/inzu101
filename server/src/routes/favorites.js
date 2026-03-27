const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const Property = require('../models/Property');

// Get user's favorites with full property details
router.get('/', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate({
            path: 'favorites',
            populate: {
                path: 'images'
            }
        });
        
        // Filter out any null values (deleted properties)
        const validFavorites = (user.favorites || []).filter(fav => fav !== null);
        
        res.json(validFavorites);
    } catch (error) {
        console.error('Error fetching favorites:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add property to favorites
router.post('/:propertyId', protect, async (req, res) => {
    try {
        const { propertyId } = req.params;
        
        // Verify property exists
        const property = await Property.findById(propertyId);
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }
        
        const user = await User.findById(req.user.id);
        
        if (!user.favorites) {
            user.favorites = [];
        }
        
        // Check if already favorited
        if (!user.favorites.includes(propertyId)) {
            user.favorites.push(propertyId);
            await user.save();
        }
        
        res.json({ message: 'Property added to favorites', propertyId });
    } catch (error) {
        console.error('Error adding favorite:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Remove property from favorites
router.delete('/:propertyId', protect, async (req, res) => {
    try {
        const { propertyId } = req.params;
        
        const user = await User.findById(req.user.id);
        
        if (user.favorites) {
            user.favorites = user.favorites.filter(
                id => id.toString() !== propertyId
            );
            await user.save();
        }
        
        res.json({ message: 'Property removed from favorites', propertyId });
    } catch (error) {
        console.error('Error removing favorite:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
