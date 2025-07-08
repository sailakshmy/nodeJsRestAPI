const bcrypt = require("bcryptjs");
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
