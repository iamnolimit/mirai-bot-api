const express = require("express");
const { tts, tempMail, qrcode, googleTranslate, weather, proxyList, screenShot, smsBomber } = require("majidapi/modules/tools");
const router = express.Router();
const { validateApiKey } = require('./member');
const fs = require('fs');
const path = require('path');

// Middleware for parsing JSON and API key validation
router.use(express.json());
router.use(validateApiKey);

/**
 * @swagger
 * tags:
 *   name: Tools
 *   description: Tools API - Various utility tools
 */

/**
 * @swagger
 * /tools/tts:
 *   post:
 *     summary: Convert text to speech
 *     tags: [Tools]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *               - gender
 *             properties:
 *               text:
 *                 type: string
 *                 description: Text to convert to speech
 *               gender:
 *                 type: string
 *                 enum: [woman, man]
 *                 description: Voice gender preference
 *     responses:
 *       200:
 *         description: Text to speech conversion result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 result:
 *                   type: object
 *       400:
 *         description: Missing or invalid parameters
 *       500:
 *         description: Server error
 */
router.post("/tts", async (req, res) => {
  try {
    const { text, gender } = req.body;

    if (!text) {
      return res.status(400).json({
        status: 400,
        message: "Text is required"
      });
    }

    if (!gender || !['woman', 'man'].includes(gender)) {
      return res.status(400).json({
        status: 400,
        message: "Valid gender (woman/man) is required"
      });
    }

    const result = await tts({
      gender,
      text
    });

    res.json({
      status: 200,
      result
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 500,
      message: "Server error",
      error: error.message
    });
  }
});

/**
 * @swagger
 * /tools/tempmail/create:
 *   get:
 *     summary: Create a new temporary email address
 *     tags: [Tools]
 *     responses:
 *       200:
 *         description: New temporary email address created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 result:
 *                   type: object
 */
router.get("/tempmail/create", async (req, res) => {
    try {
        const response = await tempMail({ method: "new" });
        res.json({ status: 200, result: response });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            status: 500, 
            message: "Server error", 
            error: error.message 
        });
    }
});

/**
 * @swagger
 * /tools/tempmail/messages:
 *   post:
 *     summary: Get messages for a temporary email address
 *     tags: [Tools]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Messages retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 result:
 *                   type: array
 */
router.post("/tempmail/messages", async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ 
                status: 400, 
                message: "Email address is required" 
            });
        }

        const response = await tempMail({ 
            method: "messages", 
            email: email 
        });
        res.json({ status: 200, result: response });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            status: 500, 
            message: "Server error", 
            error: error.message 
        });
    }
});

/**
 * @swagger
 * /tools/qrcode:
 *   post:
 *     summary: Generate QR code
 *     tags: [Tools]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 description: Text to encode in QR code
 *               size:
 *                 type: integer
 *                 description: QR code size in pixels
 *                 default: 512
 *     responses:
 *       200:
 *         description: QR code generation result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 result:
 *                   type: object
 */
router.post("/qrcode", async (req, res) => {
    const tempFile = path.join(__dirname, `../temp/qr-${Date.now()}.png`);
    try {
        const { text, size = 512 } = req.body;

        if (!text) {
            return res.status(400).json({
                status: 400,
                message: "Text is required"
            });
        }

        await qrcode({
            text,
            size,
            out: tempFile
        });

        // Send file and delete after sending
        res.sendFile(tempFile, (err) => {
            if (err) {
                console.error('Error sending file:', err);
            }
            // Delete the temporary file
            fs.unlink(tempFile, (unlinkErr) => {
                if (unlinkErr) {
                    console.error('Error deleting temporary file:', unlinkErr);
                }
            });
        });
    } catch (error) {
        // Clean up file if exists and there was an error
        if (fs.existsSync(tempFile)) {
            fs.unlinkSync(tempFile);
        }
        console.error('QR code generation error:', error);
        return res.status(500).json({
            status: 500,
            message: "Server error",
            error: error.message
        });
    }
});

/**
 * @swagger
 * /tools/translate:
 *   post:
 *     summary: Translate text using Google Translate
 *     tags: [Tools]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *               - to
 *             properties:
 *               text:
 *                 type: string
 *                 description: Text to translate
 *               to:
 *                 type: string
 *                 description: Target language code (e.g., 'en', 'es', 'id')
 *     responses:
 *       200:
 *         description: Translation result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 result:
 *                   type: object
 */
router.post("/translate", async (req, res) => {
    try {
        const { text, to } = req.body;

        if (!text) {
            return res.status(400).json({
                status: 400,
                message: "Text is required"
            });
        }

        if (!to) {
            return res.status(400).json({
                status: 400,
                message: "Target language (to) is required"
            });
        }

        const result = await googleTranslate({
            text,
            to
        });

        res.json({
            status: 200,
            result
        });
    } catch (error) {
        console.error('Translation error:', error);
        return res.status(500).json({
            status: 500,
            message: "Server error",
            error: error.message
        });
    }
});

/**
 * @swagger
 * /tools/weather:
 *   post:
 *     summary: Get weather information for a city
 *     tags: [Tools]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - city
 *             properties:
 *               city:
 *                 type: string
 *                 description: City name
 *     responses:
 *       200:
 *         description: Weather information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 result:
 *                   type: object
 */
router.post("/weather", async (req, res) => {
    try {
        const { city } = req.body;

        if (!city) {
            return res.status(400).json({
                status: 400,
                message: "City name is required"
            });
        }

        const result = await weather({
            city
        });

        res.json({
            status: 200,
            result
        });
    } catch (error) {
        console.error('Weather API error:', error);
        return res.status(500).json({
            status: 500,
            message: "Server error",
            error: error.message
        });
    }
});

/**
 * @swagger
 * /tools/proxy:
 *   post:
 *     summary: Get list of proxies
 *     tags: [Tools]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - protocol
 *             properties:
 *               protocol:
 *                 type: string
 *                 enum: [socks5, socks4]
 *                 description: Proxy protocol type
 *     responses:
 *       200:
 *         description: List of proxies
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 result:
 *                   type: array
 *       400:
 *         description: Missing or invalid protocol
 *       500:
 *         description: Server error
 */
router.post("/proxy", async (req, res) => {
    try {
        const { protocol } = req.body;

        if (!protocol || !['socks5', 'socks4'].includes(protocol)) {
            return res.status(400).json({
                status: 400,
                message: "Valid protocol (socks5/socks4) is required"
            });
        }

        const result = await proxyList({ protocol });
        res.json({ status: 200, result });
    } catch (error) {
        console.error('Proxy list error:', error);
        return res.status(500).json({
            status: 500,
            message: "Server error",
            error: error.message
        });
    }
});

/**
 * @swagger
 * /tools/screenshot:
 *   post:
 *     summary: Take screenshot of a webpage
 *     tags: [Tools]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - url
 *             properties:
 *               url:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [photo, url]
 *               width:
 *                 type: integer
 *                 default: 1280
 *               height:
 *                 type: integer
 *                 default: 2000
 *     responses:
 *       200:
 *         description: Screenshot image
 *         content:
 *           image/jpeg:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Missing or invalid URL
 *       500:
 *         description: Server error
 */
router.post("/screenshot", async (req, res) => {
    const tempFile = path.join(__dirname, `../temp/screenshot-${Date.now()}.jpg`);
    try {
        const { url, type = "photo", width = 1280, height = 2000 } = req.body;

        if (!url) {
            return res.status(400).json({
                status: 400,
                message: "URL is required"
            });
        }

        await screenShot({
            type,
            url,
            width,
            height,
            out: tempFile
        });

        res.sendFile(tempFile, (err) => {
            if (err) {
                console.error('Error sending file:', err);
            }
            fs.unlink(tempFile, (unlinkErr) => {
                if (unlinkErr) {
                    console.error('Error deleting temporary file:', unlinkErr);
                }
            });
        });
    } catch (error) {
        if (fs.existsSync(tempFile)) {
            fs.unlinkSync(tempFile);
        }
        console.error('Screenshot error:', error);
        return res.status(500).json({
            status: 500,
            message: "Server error",
            error: error.message
        });
    }
});

/**
 * @swagger
 * /tools/smsbomber:
 *   post:
 *     summary: Send SMS bomber
 *     tags: [Tools]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *             properties:
 *               phone:
 *                 type: string
 *                 description: Phone number
 *     responses:
 *       200:
 *         description: SMS bomber result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 result:
 *                   type: object
 *       400:
 *         description: Missing phone number
 *       500:
 *         description: Server error
 */
router.post("/smsbomber", async (req, res) => {
    try {
        const { phone } = req.body;

        if (!phone) {
            return res.status(400).json({
                status: 400,
                message: "Phone number is required"
            });
        }

        const result = await smsBomber({ phone });
        res.json({ status: 200, result });
    } catch (error) {
        console.error('SMS Bomber error:', error);
        return res.status(500).json({
            status: 500,
            message: "Server error",
            error: error.message
        });
    }
});

module.exports = router;