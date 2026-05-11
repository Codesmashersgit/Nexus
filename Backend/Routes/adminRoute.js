
const express = require("express");
const router = express.Router();
const adminController = require("../Controller/adminController");
const auth = require("../Middleware/Auth");
const admin = require("../Middleware/Admin");

// All routes here are protected by both general auth and admin middleware
router.get("/stats", auth, admin, adminController.getStats);
router.get("/users", auth, admin, adminController.getAllUsers);
router.put("/user-role", auth, admin, adminController.updateUserRole);
router.delete("/user/:id", auth, admin, adminController.deleteUser);

module.exports = router;
