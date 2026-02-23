const express = require("express");
const router = express.Router();
const { createOrder, verifyPayment } = require("../Controller/paymentController");
const authMiddleware = require("../Middleware/Auth");

// Route to create a Razorpay order
router.post("/create-order", authMiddleware, createOrder);

// Route to verify the Razorpay payment signature
router.post("/verify", authMiddleware, verifyPayment);

module.exports = router;
