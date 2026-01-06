const express = require('express');
const router = express.Router();
const { createAdmin, loginAdmin, displayAdmin, updateAdmin } = require('../controllers/adminCotrollers');

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin management API
 */

/**
 * @swagger
 * /admin/create:
 *   post:
 *     summary: Create a new admin
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Admin created successfully
 *       500:
 *         description: Server error
 */
router.post('/create', createAdmin);

/**
 * @swagger
 * /admin/login:
 *   post:
 *     summary: Login for admin
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 admin:
 *                   type: object
 *       401:
 *         description: Invalid credentials
 *       404:
 *         description: Admin not found
 */
router.post('/login', loginAdmin);

/**
 * @swagger
 * /admin/display/{id}:
 *   get:
 *     summary: Get admin details by ID
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The admin ID
 *     responses:
 *       200:
 *         description: Admin details
 *       404:
 *         description: Admin not found
 *       500:
 *         description: Server error
 */
router.get('/display/:id', displayAdmin);

/**
 * @swagger
 * /admin/update/{id}:
 *   put:
 *     summary: Update admin email or password
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The admin ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Admin updated successfully
 *       400:
 *         description: One or more fields missing or invalid / Email already exists
 *       404:
 *         description: Admin not found
 *       500:
 *         description: Server error
 */
router.put('/update/:id', updateAdmin);

module.exports = router;
