const bcrypt = require("bcryptjs");
const validator = require("validator");

const User = require("../models/user");

module.exports = {
  // hello() {
  //   return {
  //     text: "Hello World",
  //     views: 1243,
  //   };
  // },
  createUser: async function (args, req) {
    const { userInput } = args;
    const { email, name, password } = userInput;
    const errors = [];
    if (!validator.isEmail(email)) {
      errors.push({ message: "Email is invalid" });
    }
    if (
      validator.isEmpty(password) ||
      !validator.isLength(password, { min: 5 })
    ) {
      errors.push({ message: "Password is too short!" });
    }
    if (errors.length > 0) {
      const error = new Error("Invalid input");
      throw error;
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const err = new Error("User already exists!");
      throw err;
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({ email, name, password: hashedPassword });
    const createdUser = await user.save();
    return { ...createdUser._doc, _id: createdUser._id.toString() };
  },
};
