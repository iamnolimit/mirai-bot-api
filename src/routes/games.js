const express = require('express');
const router = express.Router();
const axios = require('axios');
const { validateApiKey } = require('./member');

// Middleware for parsing JSON and API key validation
router.use(express.json());
router.use(validateApiKey);

/**
 * @swagger
 * tags:
 *   name: Games
 *   description: Games API - Various game services
 */

/**
 * @swagger
 * /games/asahotak:
 *   get:
 *     summary: Get Asah Otak quiz
 *     tags: [Games]
 *     responses:
 *       200:
 *         description: Quiz data retrieved successfully
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
 *                     soal:
 *                       type: string
 *                     jawaban:
 *                       type: string
 *       500:
 *         description: Server error
 */
router.get("/asahotak", async (req, res) => {
  try {
    const response = await axios.get('https://er-api.biz.id/games/asahotak');
    
    res.json({
      status: 200,
      result: {
        soal: response.data.hasil.soal,
        jawaban: response.data.hasil.jawaban
      }
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
 * /games/caklontong:
 *   get:
 *     summary: Get Cak Lontong quiz
 *     tags: [Games]
 *     responses:
 *       200:
 *         description: Quiz data retrieved successfully
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
 *                     soal:
 *                       type: string
 *                     jawaban:
 *                       type: string
 *                     deskripsi:
 *                       type: string
 *       500:
 *         description: Server error
 */
router.get("/caklontong", async (req, res) => {
  try {
    const response = await axios.get('https://er-api.biz.id/games/caklontong');
    
    res.json({
      status: 200,
      result: {
        soal: response.data.hasil.soal,
        jawaban: response.data.hasil.jawaban,
        deskripsi: response.data.hasil.deskripsi
      }
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
 * /games/family100:
 *   get:
 *     summary: Get Family 100 quiz
 *     tags: [Games]
 *     responses:
 *       200:
 *         description: Quiz data retrieved successfully
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
 *                     soal:
 *                       type: string
 *                     jawaban:
 *                       type: array
 *                       items:
 *                         type: string
 *       500:
 *         description: Server error
 */
router.get("/family100", async (req, res) => {
  try {
    const response = await axios.get('https://er-api.biz.id/games/family100');
    
    res.json({
      status: 200,
      result: {
        soal: response.data.hasil.soal,
        jawaban: response.data.hasil.jawaban
      }
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
 * /games/siapakahaku:
 *   get:
 *     summary: Get Siapakah Aku quiz
 *     tags: [Games]
 *     responses:
 *       200:
 *         description: Quiz data retrieved successfully
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
 *                     soal:
 *                       type: string
 *                     jawaban:
 *                       type: string
 *                     tipe:
 *                       type: string
 *                       nullable: true
 *       500:
 *         description: Server error
 */
router.get("/siapakahaku", async (req, res) => {
  try {
    const response = await axios.get('https://er-api.biz.id/games/siapakahaku');
    
    res.json({
      status: 200,
      result: {
        soal: response.data.hasil.soal,
        jawaban: response.data.hasil.jawaban,
        tipe: response.data.hasil.tipe || null
      }
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
 * /games/susunkata:
 *   get:
 *     summary: Get Susun Kata quiz
 *     tags: [Games]
 */
router.get("/susunkata", async (req, res) => {
  try {
    const response = await axios.get('https://er-api.biz.id/games/susunkata');
    
    res.json({
      status: 200,
      result: {
        soal: response.data.hasil.soal,
        tipe: response.data.hasil.tipe,
        jawaban: response.data.hasil.jawaban
      }
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
 * /games/tebakgambar:
 *   get:
 *     summary: Get Tebak Gambar quiz
 *     tags: [Games]
 *     responses:
 *       200:
 *         description: Quiz data retrieved successfully
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
 *                     img:
 *                       type: string
 *                       format: uri
 *                     jawaban:
 *                       type: string
 *                     deskripsi:
 *                       type: string
 *       500:
 *         description: Server error
 */
router.get("/tebakgambar", async (req, res) => {
  try {
    const response = await axios.get('https://er-api.biz.id/games/tebakgambar');
    
    res.json({
      status: 200,
      result: {
        img: response.data.hasil.img,
        jawaban: response.data.hasil.jawaban,
        deskripsi: response.data.hasil.deskripsi
      }
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
 * /games/tebakkata:
 *   get:
 *     summary: Get Tebak Kata quiz
 *     tags: [Games]
 */
router.get("/tebakkata", async (req, res) => {
  try {
    const response = await axios.get('https://er-api.biz.id/games/tebakkata');
    
    res.json({
      status: 200,
      result: {
        soal: response.data.hasil.soal,
        jawaban: response.data.hasil.jawaban
      }
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
 * /games/tebaklirik:
 *   get:
 *     summary: Get Tebak Lirik quiz
 *     tags: [Games]
 */
router.get("/tebaklirik", async (req, res) => {
  try {
    const response = await axios.get('https://er-api.biz.id/games/tebaklirik');
    
    res.json({
      status: 200,
      result: {
        soal: response.data.hasil.soal,
        jawaban: response.data.hasil.jawaban
      }
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
 * /games/tebaktebakan:
 *   get:
 *     summary: Get Tebak-tebakan quiz
 *     tags: [Games]
 */
router.get("/tebaktebakan", async (req, res) => {
  try {
    const response = await axios.get('https://er-api.biz.id/games/tebaktebakan');
    
    res.json({
      status: 200,
      result: {
        soal: response.data.hasil.soal,
        jawaban: response.data.hasil.jawaban
      }
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
 * /games/truth:
 *   get:
 *     summary: Get Truth question
 *     tags: [Games]
 *     responses:
 *       200:
 *         description: Truth question retrieved successfully
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
 *                     pertanyaan:
 *                       type: string
 *       500:
 *         description: Server error
 */
router.get("/truth", async (req, res) => {
  try {
    const response = await axios.get('https://er-api.biz.id/games/truth');
    
    res.json({
      status: 200,
      result: {
        pertanyaan: response.data.hasil
      }
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
 * /games/dare:
 *   get:
 *     summary: Get Dare challenge
 *     tags: [Games]
 *     responses:
 *       200:
 *         description: Dare challenge retrieved successfully
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
 *                     tantangan:
 *                       type: string
 *       500:
 *         description: Server error
 */
router.get("/dare", async (req, res) => {
  try {
    const response = await axios.get('https://er-api.biz.id/games/dare');
    
    res.json({
      status: 200,
      result: {
        tantangan: response.data.hasil
      }
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

module.exports = router;