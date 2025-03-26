const {
  alquran,
  asmaulhusna,
} = require("@bochilteam/scraper-religions");
const express = require("express");
const router = express.Router();
const { validateApiKey } = require('./member');

// Middleware for parsing JSON and API key validation
router.use(express.json());
router.use(validateApiKey);

/**
 * @swagger
 * tags:
 *   name: Religion
 *   description: Religion API - Islamic religious data
 */

/**
 * @swagger
 * /religion/alquran:
 *   post:
 *     summary: Get Quran data
 *     tags: [Religion]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               surah:
 *                 type: integer
 *                 description: Surah number (1-114)
 *               ayat:
 *                 type: integer
 *                 description: Ayat number
 *     responses:
 *       200:
 *         description: Quran data
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
 *       500:
 *         description: Server error
 */
// Add endpoints for Alquran and Asmaul Husna
router.post("/alquran", async (req, res) => {
  try {
    const { surah, ayat } = req.body;

    let data;

    // If no parameters are provided, get all surahs
    if (!surah && !ayat) {
      data = await alquran();
    }
    // If only surah is provided
    else if (surah && !ayat) {
      data = await alquran(surah);
    }
    // If both surah and ayat are provided
    else {
      data = await alquran(surah, ayat);
    }

    res.json({
      status: 200,
      result: data,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      status: 500,
      message: "Server error",
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /religion/asmaulhusna:
 *   get:
 *     summary: Get Asmaul Husna (99 names of Allah)
 *     tags: [Religion]
 *     responses:
 *       200:
 *         description: List of Asmaul Husna
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
 *                     properties:
 *                       index:
 *                         type: integer
 *                       latin:
 *                         type: string
 *                       arabic:
 *                         type: string
 *                       translation_id:
 *                         type: string
 *                       translation_en:
 *                         type: string
 *       500:
 *         description: Server error
 */
router.get("/asmaulhusna", async (req, res) => {
  try {
    const data = await asmaulhusna();
    res.json({
      status: 200,
      result: data,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      status: 500,
      message: "Server error",
    });
  }
});

module.exports = router;
