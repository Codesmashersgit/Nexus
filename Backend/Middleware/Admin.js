
const User = require("../Model/User");

module.exports = async (req, res, next) => {
  try {
    // Check if user role is admin from token or DB
    // To be more secure, we check from DB
    const user = await User.findById(req.user.id);
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied. Admin privileges required." });
    }
    
    next();
  } catch (err) {
    console.error("Admin middleware error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
