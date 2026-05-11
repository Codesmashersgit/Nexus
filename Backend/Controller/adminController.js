
const User = require("../Model/User");

exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const proUsers = await User.countDocuments({ "subscription.planType": "pro", "subscription.active": true });
    const enterpriseUsers = await User.countDocuments({ "subscription.planType": "enterprise", "subscription.active": true });
    const freeUsers = totalUsers - proUsers - enterpriseUsers;

    // Aggregate call usage
    const users = await User.find({}, "callUsage createdAt subscription");
    const totalCalls = users.reduce((acc, user) => acc + (user.callUsage?.count || 0), 0);

    // Revenue calculation (Mock prices: Pro=499, Enterprise=4999)
    // Note: In a real app, you'd have a Payment model.
    const revenue = (proUsers * 499) + (enterpriseUsers * 4999);

    // Get recent signups (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentSignups = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

    // Growth data for chart (Last 7 days)
    const growthData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const start = new Date(d.setHours(0, 0, 0, 0));
      const end = new Date(d.setHours(23, 59, 59, 999));
      
      const count = await User.countDocuments({ createdAt: { $gte: start, $lte: end } });
      growthData.push({
        date: start.toLocaleDateString('en-US', { weekday: 'short' }),
        count
      });
    }

    res.json({
      totalUsers,
      proUsers,
      enterpriseUsers,
      freeUsers,
      totalCalls,
      revenue,
      recentSignups,
      growthData
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { userId, role } = req.body;
    const user = await User.findByIdAndUpdate(userId, { role }, { new: true });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
