const express = require("express");
const { youtubeSearch } = require("@bochilteam/scraper-youtube");
const { igdl, ttdl, fbdown, twitter } = require('btch-downloader');
const ddownr = require('denethdev-ytmp3');
const { terabox } = require("rana-videos-downloader");
const { spotify } = require("majidapi/modules/music");
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
 *   name: Downloader
 *   description: Downloader API - Various media download services
 */

/**
 * @swagger
 * /downloader/ytsearch:
 *   post:
 *     summary: Search YouTube videos
 *     tags: [Downloader]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - query
 *             properties:
 *               query:
 *                 type: string
 *                 description: Search query
 *     responses:
 *       200:
 *         description: YouTube search results
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
 *                     type: object
 *       400:
 *         description: Missing search query
 *       500:
 *         description: Server error
 */
router.post("/ytsearch", async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res
        .status(400)
        .json({ status: 400, message: "Search query is required" });
    }

    const data = await youtubeSearch(query);
    res.json({ status: 200, result: data });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: 500, message: "Server error", error: error.message });
  }
});

/**
 * @swagger
 * /downloader/ytdl:
 *   post:
 *     summary: Download YouTube videos
 *     tags: [Downloader]
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
 *                 description: YouTube video URL
 *     responses:
 *       200:
 *         description: YouTube video stream
 *         content:
 *           video/mp4:
 *             schema:
 *               type: string
 *               format: binary
 */
router.post("/ytdl", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ status: false, message: "URL is required" });
    }

    try {
      new URL(url);
    } catch {
      return res.status(400).json({ status: false, message: "Invalid URL format" });
    }

    const [mp3Result, mp4Result, songInfo] = await Promise.all([
      ddownr.download(url, 'mp3'),
      ddownr.download(url, '480'),
      youtubeSearch(url)
    ]);
    const resultSong = songInfo.video[0];

    res.json({
      status: true,
      result: {
        title: resultSong.title || "Unknown Title",
        description: resultSong.description?.slice(0, 150) + "..." || "No description available",
        duration: resultSong.durationH || 0,
        views: resultSong.viewH || 0,
        thumb: resultSong.thumbnail || "",
        source: url,
        mp3: mp3Result.downloadUrl || "",
        mp4: mp4Result.downloadUrl || ""
      }
    });

    // Cleanup base files after response is sent
    const tempDir = path.join(__dirname, '../../');
    fs.readdir(tempDir, (err, files) => {
      if (err) {
        console.error('Error reading temp directory:', err);
        return;
      }
      
      files.forEach(file => {
        if (file.endsWith('-base.js')) {
          fs.unlink(path.join(tempDir, file), (unlinkErr) => {
            if (unlinkErr) {
              console.error(`Error deleting file ${file}:`, unlinkErr);
            } else {
              console.log(`Successfully deleted ${file}`);
            }
          });
        }
      });
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message
    });
  }
});

/**
 * @swagger
 * /downloader/instagram:
 *   post:
 *     summary: Download Instagram content
 *     tags: [Downloader]
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
 *                 description: Instagram post URL
 *     responses:
 *       200:
 *         description: Instagram download links
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
 *         description: Missing or invalid URL
 *       500:
 *         description: Server error
 */
router.post("/instagram", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ status: 400, message: "URL is required" });
    }

    try {
      new URL(url);
    } catch {
      return res
        .status(400)
        .json({ status: 400, message: "Invalid URL format" });
    }

    const data = await igdl(url);
    res.json({ status: 200, result: data });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: 500, message: "Server error", error: error.message });
  }
});

/**
 * @swagger
 * /downloader/tiktok:
 *   post:
 *     summary: Download TikTok videos
 *     tags: [Downloader]
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
 *                 description: TikTok video URL
 *     responses:
 *       200:
 *         description: TikTok download links
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
 *         description: Missing or invalid URL
 *       500:
 *         description: Server error
 */
router.post("/tiktok", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ status: 400, message: "URL is required" });
    }

    try {
      new URL(url);
    } catch {
      return res
        .status(400)
        .json({ status: 400, message: "Invalid URL format" });
    }

    const data = await ttdl(url);
    res.json({ status: 200, result: data });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: 500, message: "Server error", error: error.message });
  }
});

/**
 * @swagger
 * /downloader/facebook:
 *   post:
 *     summary: Download Facebook videos
 *     tags: [Downloader]
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
 *                 description: Facebook video URL
 *     responses:
 *       200:
 *         description: Facebook download links
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
 *         description: Missing or invalid URL
 *       500:
 *         description: Server error
 */
router.post("/facebook", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ status: 400, message: "URL is required" });
    }

    try {
      new URL(url);
    } catch {
      return res
        .status(400)
        .json({ status: 400, message: "Invalid URL format" });
    }

    const data = await fbdown(url);
    res.json({ status: 200, result: data });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: 500, message: "Server error", error: error.message });
  }
});

/**
 * @swagger
 * /downloader/twitter:
 *   post:
 *     summary: Download Twitter/X videos
 *     tags: [Downloader]
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
 *                 description: Twitter/X post URL
 *     responses:
 *       200:
 *         description: Twitter download links
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
 *         description: Missing or invalid URL
 *       500:
 *         description: Server error
 */
router.post("/twitter", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ status: 400, message: "URL is required" });
    }

    try {
      new URL(url);
    } catch {
      return res
        .status(400)
        .json({ status: 400, message: "Invalid URL format" });
    }

    const data = await twitter(url);
    res.json({ status: 200, result: data });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: 500, message: "Server error", error: error.message });
  }
});

/**
 * @swagger
 * /downloader/terabox:
 *   post:
 *     summary: Download Terabox files
 *     tags: [Downloader]
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
 *                 description: Terabox file URL
 *     responses:
 *       200:
 *         description: Terabox download links
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
 *         description: Missing or invalid URL
 *       500:
 *         description: Server error
 */

router.post("/terabox", async (req, res) => {
    try {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({ status: 400, message: "URL is required" });
        }

        try {
            new URL(url);
        } catch {
            return res.status(400).json({ status: 400, message: "Invalid URL format" });
        }

        const response = await terabox(url);
        // Restructure the response to only include necessary data
        const result = {
            status: 200,
            result: {
                data: {
                    file_name: response.data.file_name,
                    video: response.data.video
                }
            }
        };
        
        res.json(result);
    } catch (error) {
        console.error('Terabox download error:', error);
        return res.status(500).json({ 
            status: 500, 
            message: "Server error", 
            error: error.message 
        });
    }
});

/**
 * @swagger
 * /downloader/spotify:
 *   post:
 *     summary: Download Spotify tracks
 *     tags: [Downloader]
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
 *                 description: Spotify track URL
 *     responses:
 *       200:
 *         description: Audio file stream
 *         content:
 *           audio/mpeg:
 *             schema:
 *               type: string
 *               format: binary
 */
router.post("/spotify", async (req, res) => {
    const tempFile = path.join(__dirname, `../temp/spotify-${Date.now()}.mp3`);
    try {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({ status: 400, message: "URL is required" });
        }

        try {
            new URL(url);
        } catch {
            return res.status(400).json({ status: 400, message: "Invalid URL format" });
        }

        await spotify({
            url: url,
            out: tempFile
        });

        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Content-Disposition', 'attachment; filename=track.mp3');

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
        console.error('Spotify download error:', error);
        return res.status(500).json({
            status: 500,
            message: "Server error",
            error: error.message
        });
    }
});

module.exports = router;
