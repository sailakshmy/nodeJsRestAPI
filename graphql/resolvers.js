const bcrypt = require("bcryptjs");
const validator = require("validator");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const { JWT_SECRET_KEY } = require("../utils/constants");
const Post = require("../models/post");
const { clearImage } = require("../utils/helper");
const user = require("../models/user");

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
      error.data = errors;
      error.code = 422;
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

  login: async function ({ email, password }) {
    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error("User not found!");
      error.code = 401;
      throw error;
    }
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error("Invalid credentials!");
      error.code = 401;
      throw error;
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email,
      },
      JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );

    return {
      token,
      userId: user._id.toString(),
    };
  },

  createPost: async function ({ postInput }, req) {
    if (!req.isAuth) {
      const err = new Error("Not Authenticated!");
      err.code = 401;
      throw err;
    }
    const { title, content, imageUrl } = postInput;
    const errors = [];
    if (validator.isEmpty(title) || !validator.isLength(title, { min: 5 })) {
      errors.push({ message: "Title is invalid!" });
    }
    if (
      validator.isEmpty(content) ||
      !validator.isLength(content, { min: 5 })
    ) {
      errors.push({ message: "Content is invalid!" });
    }
    if (errors.length > 0) {
      const error = new Error("Invalid input!");
      error.data = errors;
      error.code = 422;
      throw error;
    }
    const user = await User.findById(req.userId);
    if (!user) {
      const err = new Error("Invalid User!");
      err.code = 401;
      throw err;
    }
    const post = new Post({ title, content, imageUrl, creator: user });
    const createdPost = await post.save();
    user.posts.push(createdPost);
    await user.save();
    return {
      ...createdPost._doc,
      _id: createdPost._id.toString(),
      createdAt: createdPost.createdAt.toISOString(),
      updatedAt: createdPost.updatedAt.toISOString(),
    };
  },

  posts: async function ({ page }, req) {
    if (!req.isAuth) {
      const er = new Error("Not Authenticated!");
      er.code = 401;
      throw er;
    }
    if (!page) {
      page = 1;
    }
    const perPage = 2;
    const totalPosts = await Post.find().countDocuments();
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .populate("creator");
    return {
      posts: posts.map((post) => ({
        ...post._doc,
        id: post._id.toString(),
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
      })),
      totalPosts,
    };
  },

  post: async function ({ id }, req) {
    if (!req.isAuth) {
      const err = new Error("Not Authenticated!");
      err.code = 401;
      throw err;
    }

    const post = await Post.findById(id).populate("creator");
    if (!post) {
      const err = new Error("No post found!");
      err.code = 404;
      throw err;
    }
    return {
      ...post._doc,
      _id: post._id.toString(),
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    };
  },

  updatePost: async function ({ id, postInput }, req) {
    if (!req.isAuth) {
      const err = new Error("Not Authenticated!");
      err.code = 401;
      throw err;
    }
    const post = await Post.findById(id).populate("creator");
    if (!post) {
      const err = new Error("No post found!");
      err.code = 404;
      throw err;
    }
    if (post.creator._id.toString() !== req.userId.toString()) {
      const err = new Error("Not authorised!");
      err.code = 403;
      throw err;
    }
    const { title, content, imageUrl } = postInput;
    const errors = [];
    if (validator.isEmpty(title) || !validator.isLength(title, { min: 5 })) {
      errors.push({ message: "Title is invalid!" });
    }
    if (
      validator.isEmpty(content) ||
      !validator.isLength(content, { min: 5 })
    ) {
      errors.push({ message: "Content is invalid!" });
    }
    if (errors.length > 0) {
      const error = new Error("Invalid input!");
      error.data = errors;
      error.code = 422;
      throw error;
    }
    post.title = title;
    post.content = content;
    if (imageUrl !== "undefined") {
      post.imageUrl = imageUrl;
    }
    const updatedPost = await post.save();
    return {
      ...updatedPost._doc,
      _id: updatedPost._id.toString(),
      createdAt: updatedPost.createdAt.toISOString(),
      updatedAt: updatedPost.updatedAt.toISOString(),
    };
  },

  deletePost: async function ({ id }, req) {
    if (!req.isAuth) {
      const err = new Error("Not Authenticated!");
      err.code = 401;
      throw err;
    }
    const post = await Post.findById(id);
    if (!post) {
      const err = new Error("No post found!");
      err.code = 404;
      throw err;
    }
    if (post.creator.toString() !== req.userId.toString()) {
      const err = new Error("Not Authorised!");
      err.code = 403;
      throw err;
    }
    clearImage(post.imageUrl);
    await Post.findByIdAndDelete(id);
    const user = await User.findById(req.userId);
    user.posts.pull(id);
    await user.save();
    return true;
  },
  user: async function (args, req) {
    if (!req.isAuth) {
      const err = new Error("Not Authenticated!");
      err.code = 401;
      throw err;
    }
    const user = await User.findById(req.userId);
    if (!user) {
      const err = new Error("Invalid User!");
      err.code = 401;
      throw err;
    }
    return {
      ...user._doc,
      _id: user._id.toString(),
    };
  },
  updateStatus: async function ({ status }, req) {
    if (!req.isAuth) {
      const err = new Error("Not Authenticated!");
      err.code = 401;
      throw err;
    }
    const user = await User.findById(req.userId);
    if (!user) {
      const err = new Error("No user found!");
      err.code = 404;
      throw err;
    }
    user.status = status;
    await user.save();
    return {
      ...user._doc,
      _id: user._id.toString(),
    };
  },
};
