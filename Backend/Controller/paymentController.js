const Razorpay = require("razorpay");
const crypto = require("crypto");

/**
 * Creates a Razorpay order
 * Amount should be in paise (e.g., 100 paise = 1 INR)
 */
exports.createOrder = async (req, res) => {
    try {
        const { amount, currency = "INR" } = req.body;

        if (!amount) {
            return res.status(400).json({ message: "Amount is required" });
        }

        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            console.error("Razorpay API keys are missing in environment variables!");
            return res.status(500).json({ message: "Payment configuration error on server" });
        }

        const instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID?.trim(),
            key_secret: process.env.RAZORPAY_KEY_SECRET?.trim(),
        });

        const options = {
            amount: parseInt(amount) * 100, // Amount in paise
            currency: currency,
            receipt: `receipt_${Date.now()}`,
        };

        const order = await instance.orders.create(options);

        if (!order) {
            console.error("Razorpay order creation returned null/undefined");
            return res.status(500).json({ message: "Failed to create order" });
        }

        res.status(200).json(order);
    } catch (error) {
        console.error("Razorpay order error details:", {
            message: error.message,
            stack: error.stack,
            errorObject: error // Log the whole error for deep inspection
        });
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message,
            details: "Please check backend logs for more information"
        });
    }
};

/**
 * Verifies Razorpay payment signature
 */
exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature === expectedSign) {
            // Update user's subscription plan
            const User = require("../Model/User");
            const { planType } = req.body;
            if (planType && req.user && req.user.id) {
                await User.findByIdAndUpdate(req.user.id, { subscriptionPlan: planType });
            }
            return res.status(200).json({ success: true, message: "Payment verified successfully" });
        } else {
            return res.status(400).json({ success: false, message: "Invalid signature sentinel" });
        }
    } catch (error) {
        console.error("Razorpay verification error:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};
