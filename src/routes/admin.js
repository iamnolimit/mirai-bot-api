const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Middleware for parsing JSON
router.use(express.json());

// Get total users count
router.get('/stats/users/count', async (req, res) => {
    try {
        const count = await User.countDocuments();
        
        res.json({
            status: 200,
            result: {
                totalUsers: count
            }
        });
    } catch (error) {
        console.error('Error getting user count:', error);
        res.status(500).json({
            status: 500,
            message: 'Server error',
            error: error.message
        });
    }
});

// Get list of all users
router.get('/users', async (req, res) => {
    try {
        const users = await User.find({}, {
            name: 1,
            email: 1,
            telegramId: 1,
            expiryDate: 1,
            maxRequestsPerDay: 1,
            dailyRequests: 1,
            createdAt: 1
        });
        
        res.json({
            status: 200,
            result: users
        });
    } catch (error) {
        console.error('Error getting users list:', error);
        res.status(500).json({
            status: 500,
            message: 'Server error',
            error: error.message
        });
    }
});

// Get user by Telegram ID
router.get('/users/telegram/:telegramId', async (req, res) => {
    try {
        const { telegramId } = req.params;
        
        const user = await User.findOne({ telegramId });
        
        if (!user) {
            return res.status(404).json({
                status: 404,
                message: 'User not found'
            });
        }
        
        res.json({
            status: 200,
            result: user
        });
    } catch (error) {
        console.error('Error getting user by Telegram ID:', error);
        res.status(500).json({
            status: 500,
            message: 'Server error',
            error: error.message
        });
    }
});

// Get API usage statistics
router.get('/stats/api', async (req, res) => {
    try {
        // Get total active users (not expired)
        const activeUsers = await User.countDocuments({
            expiryDate: { $gt: new Date() }
        });
        
        // Get users close to expiry (within 3 days)
        const thresholdDate = new Date();
        thresholdDate.setDate(thresholdDate.getDate() + 3);
        
        const nearExpiryUsers = await User.countDocuments({
            expiryDate: { 
                $gt: new Date(),
                $lt: thresholdDate
            }
        });
        
        // Get users who have reached 80% of their daily limit
        const highUsageUsers = await User.find({
            $expr: {
                $gte: [
                    { $divide: ["$dailyRequests", "$maxRequestsPerDay"] },
                    0.8
                ]
            }
        }).count();
        
        res.json({
            status: 200,
            result: {
                totalUsers: await User.countDocuments(),
                activeUsers,
                expiredUsers: await User.countDocuments({
                    expiryDate: { $lt: new Date() }
                }),
                nearExpiryUsers,
                highUsageUsers
            }
        });
    } catch (error) {
        console.error('Error getting API stats:', error);
        res.status(500).json({
            status: 500,
            message: 'Server error',
            error: error.message
        });
    }
});

// Update user by Telegram ID
router.put('/users/telegram/:telegramId', async (req, res) => {
    try {
        const { telegramId } = req.params;
        const { name, email, maxRequestsPerDay, expiryDays } = req.body;
        
        const user = await User.findOne({ telegramId });
        
        if (!user) {
            return res.status(404).json({
                status: 404,
                message: 'User not found'
            });
        }
        
        // Update user fields if provided
        if (name) user.name = name;
        if (email) user.email = email;
        if (maxRequestsPerDay) user.maxRequestsPerDay = maxRequestsPerDay;
        
        // Extend expiry if days provided
        if (expiryDays) {
            const currentExpiry = new Date(user.expiryDate);
            currentExpiry.setDate(currentExpiry.getDate() + parseInt(expiryDays));
            user.expiryDate = currentExpiry;
        }
        
        await user.save();
        
        res.json({
            status: 200,
            message: 'User updated successfully',
            result: user
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({
            status: 500,
            message: 'Server error',
            error: error.message
        });
    }
});

// Reset user daily requests
router.post('/users/reset-daily/:telegramId', async (req, res) => {
    try {
        const { telegramId } = req.params;
        
        const user = await User.findOne({ telegramId });
        
        if (!user) {
            return res.status(404).json({
                status: 404,
                message: 'User not found'
            });
        }
        
        user.dailyRequests = 0;
        await user.save();
        
        res.json({
            status: 200,
            message: 'Daily requests reset successfully'
        });
    } catch (error) {
        console.error('Error resetting daily requests:', error);
        res.status(500).json({
            status: 500,
            message: 'Server error',
            error: error.message
        });
    }
});

module.exports = router;