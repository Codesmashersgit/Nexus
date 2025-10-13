
const User = require("../Model/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register
exports.register = async (req, res) => {
  try {
    const { email, password, username, phone } = req.body;

    if (!email || !password || !username || !phone) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existingEmail = await User.findOne({ email });
    const existingPhone = await User.findOne({ phone });

    if (existingEmail) return res.status(400).json({ message: "Email already registered." });
    if (existingPhone) return res.status(400).json({ message: "Phone number already registered." });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, username, password: hashedPassword, phone });

    const token = jwt.sign({ id: user._id, email }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(201).json({
      token,
      user: { id: user._id, email: user.email, username: user.username, phone: user.phone },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
}


// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email and password are required." });

  try {
    const user = await User.findOne({ email });
    if (!user || !user.password)
      return res.status(400).json({ message: "Invalid email or password." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password." });

    const token = jwt.sign({ id: user._id, email }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      token,
      user: { id: user._id, email: user.email, username: user.username },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
};
