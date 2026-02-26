const express = require("express");
const router = express.Router();
const { getAISuggestions } = require("../Controller/aiController");

router.post("/suggest", getAISuggestions);

module.exports = router;
