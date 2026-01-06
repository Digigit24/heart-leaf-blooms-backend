const express = require("express");
const vendorRoute = express.Router();

/**
 * @swagger
 * tags:
 *   name: Vendor
 *   description: Vendor management API
 */

/**
 * @swagger
 * /vendor:
 *   get:
 *     summary: Vendor route test
 *     tags: [Vendor]
 *     responses:
 *       200:
 *         description: Vendor route works
 */
vendorRoute.get("/", (req, res) => {
    res.send("vendor route")
})



module.exports = vendorRoute;
