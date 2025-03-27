const express = require("express");
const bingAPI = require('btch-bing-cn');
const { gpt, copilot, video } = require("majidapi/modules/ai");
const { blurBackground, removeBackground } = require("majidapi/modules/image");
const fs = require('fs');
const path = require('path');
const router = express.Router();
const { validateApiKey } = require('./member');

// Middleware for parsing JSON and API key validation
router.use(express.json());
router.use(validateApiKey);

/**
 * @swagger
 * tags:
 *   name: Artificial
 *   description: Artificial Intelligence API - Various AI services
 */

/**
 * @swagger
 * /artificial/bing:
 *   get:
 *     summary: Get random Bing wallpaper image URL
 *     tags: [Artificial]
 *     responses:
 *       200:
 *         description: Random Bing wallpaper URL
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 result:
 *                   type: string
 *                   description: Image URL
 *       500:
 *         description: Server error
 */
router.get("/bing", async (req, res) => {
  try {
    const bingImageURL = await bingAPI.bing();
    res.json({ 
      status: 200, 
      result: bingImageURL 
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: 500, message: "Server error", error: error.message });
  }
});

/**
 * @swagger
 * /artificial/bingjson:
 *   get:
 *     summary: Get random Bing wallpaper with complete metadata
 *     tags: [Artificial]
 *     responses:
 *       200:
 *         description: Random Bing wallpaper data
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
 *                   properties:
 *                     url:
 *                       type: string
 *                     copyright:
 *                       type: string
 *                     title:
 *                       type: string
 *       500:
 *         description: Server error
 */
router.get("/bingjson", async (req, res) => {
  try {
    const bingImageData = await bingAPI.bingjson();
    res.json({ 
      status: 200, 
      result: bingImageData 
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: 500, message: "Server error", error: error.message });
  }
});

/**
 * @swagger
 * /artificial/binggen:
 *   post:
 *     summary: Generate images using Bing Image Creator with advanced options
 *     tags: [Artificial]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - prompt
 *             properties:
 *               prompt:
 *                 type: string
 *                 description: Text prompt for image generation
 *     responses:
 *       200:
 *         description: Generated image links
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
 *                   items:
 *                     type: string
 *                 requestId:
 *                   type: string
 *       400:
 *         description: Missing prompt
 *       500:
 *         description: Server error
 */
router.post("/binggen", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ status: 400, message: "Prompt is required" });
    }

    // Handle redirect function
    const handleRedirect = (requestId, redirectUrl) => {
      console.log(`Received redirect request with ID ${requestId}. Redirecting to ${redirectUrl}.`);
    };

    // Use dynamic import for ES Module
    const bimgNew = await import('bimg-new');
    try {
      // The error suggests we need to pass proper parameters
      const imageLinks = await bimgNew.generateImagesLinks(prompt, handleRedirect);
      
      // Extract requestId from the first image URL if available
      let requestId = null;
      if (imageLinks && imageLinks.length > 0 && typeof imageLinks[0] === 'string') {
        try {
          const url = new URL(imageLinks[0]);
          const params = new URLSearchParams(url.search);
          requestId = params.get('id');
        } catch (urlError) {
          console.error("Error parsing image URL:", urlError);
        }
      }

      res.json({ 
        status: 200, 
        result: imageLinks,
        requestId: requestId
      });
    } catch (genError) {
      console.error("Image generation error:", genError);
      
      // Try alternative method if the first one fails
      try {
        console.log("Trying alternative image generation method...");
        const imageLinks = await bimgNew.createImagesFromBing(prompt, options);
        
        res.json({ 
          status: 200, 
          result: imageLinks,
          message: "Generated using alternative method"
        });
      } catch (altError) {
        throw new Error(`Failed to generate images: ${genError.message}, Alternative method error: ${altError.message}`);
      }
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ 
        status: 500, 
        message: "Server error", 
        error: error.message,
        hint: "You may need to provide a valid Bing authentication cookie in the auth_cookie parameter"
      });
  }
});

/**
 * @swagger
 * /artificial/gpt:
 *   post:
 *     summary: Generate text using GPT models
 *     tags: [Artificial]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - model
 *               - question
 *             properties:
 *               model:
 *                 type: string
 *                 enum: ['3', '3.5', 'evil']
 *                 description: GPT model version
 *               question:
 *                 type: string
 *                 description: Input text/prompt
 *     responses:
 *       200:
 *         description: Generated text response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 result:
 *                   type: string
 *       400:
 *         description: Missing or invalid parameters
 *       500:
 *         description: Server error
 */
router.post("/gpt", async (req, res) => {
  try {
    const { model, question } = req.body;

    if (!model || !question) {
      return res.status(400).json({ 
        status: 400, 
        message: "Model and question are required" 
      });
    }

    if (!['3', '3.5', 'evil'].includes(model)) {
      return res.status(400).json({ 
        status: 400, 
        message: "Invalid model. Use '3', '3.5', or 'evil'" 
      });
    }

    const response = await gpt({
      model,
      question
    });

    res.json({ 
      status: 200, 
      result: response 
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
 * /artificial/copilot:
 *   post:
 *     summary: Chat with GitHub Copilot
 *     tags: [Artificial]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - question
 *             properties:
 *               question:
 *                 type: string
 *                 description: Question or prompt for Copilot
 *     responses:
 *       200:
 *         description: Copilot response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 result:
 *                   type: string
 *       400:
 *         description: Missing question
 *       500:
 *         description: Server error
 */
router.post("/copilot", async (req, res) => {
    try {
        const { question } = req.body;

        if (!question) {
            return res.status(400).json({
                status: 400,
                message: "Question is required"
            });
        }

        const result = await copilot({ question });
        res.json({ status: 200, result });
    } catch (error) {
        console.error('Copilot error:', error);
        return res.status(500).json({
            status: 500,
            message: "Server error",
            error: error.message
        });
    }
});

/**
 * @swagger
 * /artificial/video:
 *   post:
 *     summary: Generate video using AI
 *     tags: [Artificial]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - prompt
 *             properties:
 *               prompt:
 *                 type: string
 *                 description: Description of the video to generate
 *     responses:
 *       200:
 *         description: Generated video result
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
 *         description: Missing prompt
 *       500:
 *         description: Server error
 */
router.post("/video", async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({
                status: 400,
                message: "Prompt is required"
            });
        }

        const result = await video({ prompt });
        res.json({ status: 200, result });
    } catch (error) {
        console.error('Video generation error:', error);
        return res.status(500).json({
            status: 500,
            message: "Server error",
            error: error.message
        });
    }
});

/**
 * @swagger
 * /artificial/blur-background:
 *   post:
 *     summary: Blur image background
 *     tags: [Artificial]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - imageURL
 *             properties:
 *               imageURL:
 *                 type: string
 *                 description: URL of the image (jpg/jpeg/png)
 *     responses:
 *       200:
 *         description: Processed image result
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
 *         description: Missing or invalid image URL
 *       500:
 *         description: Server error
 */
router.post("/blur-background", async (req, res) => {
    try {
        const { imageURL } = req.body;

        if (!imageURL) {
            return res.status(400).json({
                status: 400,
                message: "Image URL is required"
            });
        }

        const result = await blurBackground({ imageURL });
        res.json({ status: 200, result });
    } catch (error) {
        console.error('Background blur error:', error);
        return res.status(500).json({
            status: 500,
            message: "Server error",
            error: error.message
        });
    }
});

/**
 * @swagger
 * /artificial/remove-background:
 *   post:
 *     summary: Remove image background
 *     tags: [Artificial]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - imageURL
 *             properties:
 *               imageURL:
 *                 type: string
 *                 description: URL of the image
 *     responses:
 *       200:
 *         description: Processed image
 *         content:
 *           image/jpeg:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Missing or invalid image URL
 *       500:
 *         description: Server error
 */
router.post("/remove-background", async (req, res) => {
    const tempFile = path.join(__dirname, `../temp/nobg-${Date.now()}.jpg`);
    try {
        const { imageURL } = req.body;

        if (!imageURL) {
            return res.status(400).json({
                status: 400,
                message: "Image URL is required"
            });
        }

        await removeBackground({
            imageURL,
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
        console.error('Background removal error:', error);
        return res.status(500).json({
            status: 500,
            message: "Server error",
            error: error.message
        });
    }
});

module.exports = router;