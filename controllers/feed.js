const { validationResult } = require("express-validator");

const Post = require("../models/post");

exports.getPosts = (req, res, next) => {
  res.status(200).json({
    posts: [
      {
        title: "first post",
        content: "This is my first post",
        imageUrl: "images/ExpenseTracker.png",
        creator: {
          name: "abc",
        },
        createdAt: new Date(),
        _id: "123",
      },
    ],
  });
};

exports.createPost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: "Validation failed",
      errros: errors.array(),
    });
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
    .catch((e) => console.log("Error while saving post to DB", e));
};
