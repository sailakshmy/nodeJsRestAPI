const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const { JWT_SECRET_KEY } = require("../utils/constants");

exports.signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed!");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  const { email, name, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new User({ email, password: hashedPassword, name });
    const savedUser = await user.save();

    res.status(201).json({
      message: "User has been registered successfully!",
      userId: savedUser._id,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const loadedUser = await User.findOne({ email });

    if (!loadedUser) {
      const error = new Error("Could not find a user with this email");
      error.statusCode = 401;
      throw error;
    }

    const isEqual = await bcrypt.compare(password, loadedUser.password);

    if (!isEqual) {
      const error = new Error("Incorrect credentials!");
      error.statusCode = 401;
      return error;
    }
    const token = jwt.sign(
      {
        email: loadedUser.email,
        userId: loadedUser._id.toString(),
      },
      JWT_SECRET_KEY,
      {
        expiresIn: "1h",
      }
    );
    res.status(200).json({
      token,
      userId: loadedUser._id.toString(),
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      const err = new Error("User not found!");
      err.statusCode = 404;
      throw err;
    }
    res.status(200).json({
      status: user.status,
    });
  } catch (e) {
    if (!e.statusCode) {
      e.statusCode = 500;
    }
    next(e);
  }
};

exports.updateUserStatus = async (req, res, next) => {
  const newStatus = req.body.status;
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      const err = new Error("User not found!");
      err.statusCode = 404;
      throw err;
    }
    user.status = newStatus;
    await user.save();

    res
      .status(200)
      .json({ message: "User status has been updated successfully!" });
  } catch (e) {
    if (!e.statusCode) {
      e.statusCode = 500;
    }
    next(e);
  }
};
