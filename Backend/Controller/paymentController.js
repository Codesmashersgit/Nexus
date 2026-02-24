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
            receipt: `rcpt_${String(req.user.id).slice(-10)}_${Date.now()}`,
        };

        console.log("Creating Razorpay order with options:", options);
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
                const user = await User.findById(req.user.id);

                // Idempotency check: if payment already processed
                if (user.subscription && user.subscription.processedPayments && user.subscription.processedPayments.includes(razorpay_payment_id)) {
                    return res.status(200).json({ success: true, message: "Payment already processed" });
                }

                // Calculate duration based on planType
                let daysToAdd = 30; // Default for 'pro'
                if (planType === 'enterprise') {
                    daysToAdd = 365; // Yearly for enterprise
                }

                let newExpiresAt;
                const now = new Date();

                // If user has an active subscription that hasn't expired yet, extend it
                if (user.subscription && user.subscription.active && user.subscription.expiresAt && user.subscription.expiresAt > now) {
                    newExpiresAt = new Date(user.subscription.expiresAt);
                    newExpiresAt.setDate(newExpiresAt.getDate() + daysToAdd);
                } else {
                    // Start new subscription from today
                    newExpiresAt = new Date(now);
                    newExpiresAt.setDate(newExpiresAt.getDate() + daysToAdd);
                }

                await User.findByIdAndUpdate(req.user.id, {
                    subscription: {
                        planType: planType,
                        active: true,
                        expiresAt: newExpiresAt,
                        $addToSet: { "subscription.processedPayments": razorpay_payment_id }
                    }
                });
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
