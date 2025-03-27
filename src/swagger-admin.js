/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin API - User and API statistics management
 */

/**
 * @swagger
 * /admin/login:
 *   post:
 *     summary: Admin login
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */

/**
 * @swagger
 * /admin/setup:
 *   post:
 *     summary: Create initial admin account (should be protected in production)
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Admin account created successfully
 *       400:
 *         description: Admin account already exists
 */

/**
 * @swagger
 * /admin/stats/users/count:
 *   get:
 *     summary: Get total users count
 *     tags: [Admin]
 *     security: []
 *     responses:
 *       200:
 *         description: Total users count
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get list of all users
 *     tags: [Admin]
 *     security: []
 *     responses:
 *       200:
 *         description: List of all users
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /admin/users/telegram/{telegramId}:
 *   get:
 *     summary: Get user by Telegram ID
 *     tags: [Admin]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: telegramId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /admin/stats/api:
 *   get:
 *     summary: Get API usage statistics
 *     tags: [Admin]
 *     security: []
 *     responses:
 *       200:
 *         description: API usage statistics
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /admin/users/telegram/{telegramId}:
 *   put:
 *     summary: Update user by Telegram ID
 *     tags: [Admin]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: telegramId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               maxRequestsPerDay:
 *                 type: integer
 *               expiryDays:
 *                 type: integer
 *     responses:
 *       200:
 *         description: User updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /admin/users/reset-daily/{telegramId}:
 *   post:
 *     summary: Reset user daily requests
 *     tags: [Admin]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: telegramId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Daily requests reset successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */