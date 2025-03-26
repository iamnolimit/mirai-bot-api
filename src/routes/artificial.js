const express = require("express");
const bingAPI = require('btch-bing-cn');
// Remove the CommonJS require and we'll use dynamic imports in each route
// const { generateImagesLinks, obtainImagesLinks, createImagesFromBing } = require("bimg-new");
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

module.exports = router;