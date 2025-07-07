const express = require("express");

const authRoutes = express.Router();

authRoutes.put("/signup");

module.exports = authRoutes;
