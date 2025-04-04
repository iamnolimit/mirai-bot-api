const express = require("express");
const { SumshiiySawer } = require("saweria-createqr");
const router = express.Router();
const { validateApiKey } = require("./member");

// Middleware for parsing JSON and API key validation
router.use(express.json());
router.use(validateApiKey);

/**
 * @swagger
 * tags:
 *   name: Payment
 *   description: Payment API - Payment QR code generation
 */

// Helper function to create a Saweria client from request
async function getSaweriaClient(req) {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    throw new Error("Username, email, and password are required");
  }

  const sawer = new SumshiiySawer({ username, email, password });
  const loginResult = await sawer.login();

  if (!loginResult.status) {
    throw new Error(loginResult.error || "Login failed");
  }

  return sawer;
}

/**
 * @swagger
 * /payment/saweria/createqr:
 *   post:
 *     summary: Create Saweria payment QR code
 *     tags: [Payment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *               - amount
 *             properties:
 *               username:
 *                 type: string
 *                 description: Saweria username
 *               email:
 *                 type: string
 *                 description: Saweria email
 *               password:
 *                 type: string
 *                 description: Saweria password
 *               amount:
 *                 type: integer
 *                 description: Payment amount in IDR
 *               duration:
 *                 type: integer
 *                 description: QR code validity duration in minutes
 *                 default: 30
 *     responses:
 *       200:
 *         description: QR code created successfully
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
 *         description: Missing required fields
 *       401:
 *         description: Authentication failed
 *       500:
 *         description: Server error
 */
router.post("/saweria/createqr", async (req, res) => {
  try {
    const { amount, duration = 30 } = req.body;

    if (!amount) {
      return res.status(400).json({
        status: 400,
        message: "Amount is required",
      });
    }

    // Get Saweria client for this request
    const sawer = await getSaweriaClient(req);

    // Create payment QR code
    const payment = await sawer.createPaymentQr(amount, duration);

    res.json({
      status: 200,
      result: payment,
    });
  } catch (error) {
    console.error(error);

    if (error.message.includes("required")) {
      return res.status(400).json({
        status: 400,
        message: error.message,
      });
    } else if (
      error.message.includes("Login failed") ||
      error.message.includes("Invalid")
    ) {
      return res.status(401).json({
        status: 401,
        message: "Authentication failed",
        error: error.message,
      });
    }

    return res.status(500).json({
      status: 500,
      message: "Failed to create QR code",
      error: error.message,
    });
  }
});

/**
 * @swagger
 * /payment/saweria/checkpayment:
 *   post:
 *     summary: Check payment status by transaction ID
 *     tags: [Payment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *               - trxId
 *             properties:
 *               username:
 *                 type: string
 *                 description: Saweria username
 *               email:
 *                 type: string
 *                 description: Saweria email
 *               password:
 *                 type: string
 *                 description: Saweria password
 *               trxId:
 *                 type: string
 *                 description: Transaction ID to check
 *     responses:
 *       200:
 *         description: Payment status information
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
 *                     trx_id:
 *                       type: string
 *                     status:
 *                       type: string
 *                     status_simbolic:
 *                       type: string
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Authentication failed
 *       404:
 *         description: Transaction not found
 *       500:
 *         description: Server error
 */
router.post("/saweria/checkpayment", async (req, res) => {
  try {
    const { trxId } = req.body;

    if (!trxId) {
      return res.status(400).json({
        status: 400,
        message: "Transaction ID is required",
      });
    }

    // Get Saweria client for this request
    const sawer = await getSaweriaClient(req);

    // Check payment status
    const paymentStatus = await sawer.cekPaymentv2(trxId);

    if (paymentStatus.code === 404) {
      return res.status(404).json({
        status: 404,
        message: "Transaction not found",
      });
    }

    res.json({
      status: 200,
      result: paymentStatus,
    });
  } catch (error) {
    console.error(error);

    if (error.message.includes("required")) {
      return res.status(400).json({
        status: 400,
        message: error.message,
      });
    } else if (
      error.message.includes("Login failed") ||
      error.message.includes("Invalid")
    ) {
      return res.status(401).json({
        status: 401,
        message: "Authentication failed",
        error: error.message,
      });
    }

    return res.status(500).json({
      status: 500,
      message: "Failed to check payment status",
      error: error.message,
    });
  }
});

module.exports = router;
