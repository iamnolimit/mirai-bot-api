const express = require('express');
const router = express.Router();
const User = require('../models/User');
const crypto = require('crypto');

// Middleware for parsing JSON
router.use(express.json());

/**
 * @swagger
 * tags:
 *   name: Member
 *   description: Member API - User management
 */

/**
 * @swagger
 * /member/status:
 *   get:
 *     summary: Check member status
 *     tags: [Member]
 *     parameters:
 *       - in: header
 *         name: X-API-Key
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Member status retrieved successfully
 */
router.get('/status', async (req, res) => {
    try {
        const apiKey = req.header('X-API-Key');
        if (!apiKey) {
            return res.status(401).json({
                status: 401,
                message: 'API key is required'
            });
        }

        const user = await User.findOne({ apiKey });
        if (!user) {
            return res.status(404).json({
                status: 404,
                message: 'User not found'
            });
        }

        res.json({
            status: 200,
            result: {
                name: user.name,
                email: user.email,
                telegramId: user.telegramId,
                expiryDate: user.expiryDate,
                maxRequestsPerDay: user.maxRequestsPerDay,
                dailyRequests: user.dailyRequests,
                lastRequestDate: user.lastRequestDate
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: 'Server error',
            error: error.message
        });
    }
});

router.post('/register', async (req, res) => {
    try {
        const { name, email, telegramId, maxRequestsPerDay = 100 } = req.body;

        // Validate required fields
        if (!name || !email || !telegramId) {
            return res.status(400).json({
                status: 400,
                message: 'Name, email, and Telegram ID are required'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { telegramId }]
        });

        if (existingUser) {
            return res.status(409).json({
                status: 409,
                message: 'User with this email or Telegram ID already exists'
            });
        }

        // Generate API key
        const apiKey = crypto.randomBytes(32).toString('hex');

        // Set expiry date to 30 days from now
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);

        // Create new user
        const user = new User({
            name,
            email,
            telegramId,
            apiKey,
            expiryDate,
            maxRequestsPerDay
        });

        await user.save();

        res.json({
            status: 200,
            result: {
                apiKey,
                expiryDate
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            status: 500,
            message: 'Server error',
            error: error.message
        });
    }
});

router.put('/update', async (req, res) => {
    try {
        const apiKey = req.header('X-API-Key');
        if (!apiKey) {
            return res.status(401).json({
                status: 401,
                message: 'API key is required'
            });
        }

        const user = await User.findOne({ apiKey });
        if (!user) {
            return res.status(404).json({
                status: 404,
                message: 'User not found'
            });
        }

        const { name, email, telegramId } = req.body;
        if (name) user.name = name;
        if (email) user.email = email;
        if (telegramId) user.telegramId = telegramId;

        await user.save();
        res.json({
            status: 200,
            message: 'User updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: 'Server error',
            error: error.message
        });
    }
});

router.post('/extend', async (req, res) => {
    try {
        const apiKey = req.header('X-API-Key');
        if (!apiKey) {
            return res.status(401).json({
                status: 401,
                message: 'API key is required'
            });
        }

        const { days } = req.body;
        if (!days || days <= 0) {
            return res.status(400).json({
                status: 400,
                message: 'Valid number of days is required'
            });
        }

        const user = await User.findOne({ apiKey });
        if (!user) {
            return res.status(404).json({
                status: 404,
                message: 'User not found'
            });
        }

        const currentExpiry = new Date(user.expiryDate);
        currentExpiry.setDate(currentExpiry.getDate() + days);
        user.expiryDate = currentExpiry;

        await user.save();
        res.json({
            status: 200,
            result: {
                newExpiryDate: user.expiryDate
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: 'Server error',
            error: error.message
        });
    }
});

router.post('/update-limit', async (req, res) => {
    try {
        const apiKey = req.header('X-API-Key');
        if (!apiKey) {
            return res.status(401).json({
                status: 401,
                message: 'API key is required'
            });
        }

        const { maxRequestsPerDay } = req.body;
        if (!maxRequestsPerDay || maxRequestsPerDay <= 0) {
            return res.status(400).json({
                status: 400,
                message: 'Valid maximum requests per day is required'
            });
        }

        const user = await User.findOne({ apiKey });
        if (!user) {
            return res.status(404).json({
                status: 404,
                message: 'User not found'
            });
        }

        user.maxRequestsPerDay = maxRequestsPerDay;
        await user.save();
        
        res.json({
            status: 200,
            result: {
                maxRequestsPerDay: user.maxRequestsPerDay
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: 'Server error',
            error: error.message
        });
    }
});

/**
 * Create middleware for API key validation
 * This can be used in other routes to protect API endpoints
 */
const validateApiKey = async (req, res, next) => {
    try {
        const apiKey = req.header('X-API-Key');

        if (!apiKey) {
            return res.status(401).json({
                status: 401,
                message: 'API key is required'
            });
        }

        // Find user by API key
        const user = await User.findOne({ apiKey });

        if (!user) {
            return res.status(401).json({
                status: 401,
                message: 'Invalid API key'
            });
        }

        // Check if API key is expired
        if (user.expiryDate < new Date()) {
            return res.status(401).json({
                status: 401,
                message: 'API key has expired'
            });
        }

        // Check daily request limit
        const today = new Date().setHours(0, 0, 0, 0);
        if (user.lastRequestDate.setHours(0, 0, 0, 0) === today) {
            if (user.dailyRequests >= user.maxRequestsPerDay) {
                return res.status(429).json({
                    status: 429,
                    message: 'Daily request limit exceeded'
                });
            }
            user.dailyRequests += 1;
        } else {
            user.dailyRequests = 1;
            user.lastRequestDate = new Date();
        }

        await user.save();
        req.user = user;
        next();
    } catch (error) {
        console.error('API key validation error:', error);
        res.status(500).json({
            status: 500,
            message: 'Server error',
            error: error.message
        });
    }
};

module.exports = { router, validateApiKey };