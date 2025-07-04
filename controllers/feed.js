const { validationResult } = require("express-validator");

const Post = require("../models/post");

exports.getPosts = (req, res, next) => {
  Post.find()
    .then((posts) => {
      res.status(200).json({
        message: "Fetched all the posts",
        posts,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }

      next(err);
    });
};

exports.createPost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed!");
    error.statusCode = 422;
    throw error;
  }
  const { title, content } = req.body;
  const post = new Post({
    title,
    content,
    imageUrl: "images/ExpenseTracker.png",
    creator: {
      name: "avdwh",
    },
  });
  post
    .save()
    .then((result) => {
      console.log("Result while saving post to Db", result);
      res.status(201).json({
        message: "Post created successfully!",
        post: result,
      });
    })
    .catch((e) => {
      if (!e.statusCode) {
        e.statusCode = 500;
      }

      next(e);
    });
};

exports.getPost = (req, res, next) => {
  const { postId } = req.params;
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("Could not find the requested post!");
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({ message: "Fetched the requested post", post });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }

      next(err);
    });
};
