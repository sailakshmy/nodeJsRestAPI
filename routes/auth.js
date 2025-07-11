const express = require("express");

const { body } = require("express-validator");

const User = require("../models/user");
const authController = require("../controllers/auth");
const authMiddleware = require("../middleware/is-auth");

const authRoutes = express.Router();

authRoutes.put(
  "/signup",
  [
    body("email")
      .trim()
      .isEmail()
      .withMessage("Please enter a valid email!")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject("Email address already exists!");
          }
        });
      })
      .normalizeEmail(),
    body("password").trim().isLength({ min: 5 }),
    body("name").trim().not().isEmpty(),
  ],
  authController.signup
);

authRoutes.post("/login", authController.login);

authRoutes.get("/status", authMiddleware, authController.getUserStatus);
authRoutes.patch(
  "/status",
  authMiddleware,
  [body("status").trim().not().isEmpty()],
  authController.updateUserStatus
);

module.exports = authRoutes;
