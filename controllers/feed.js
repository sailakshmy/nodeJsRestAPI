const { validationResult } = require("express-validator");

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
  // Create a post in DB
  res.status(201).json({
    message: "Post created successfully!",
    post: {
      _id: new Date().toISOString(),
      title,
      content,
      creator: {
        name: "avdwh",
      },
      createdAt: new Date(),
    },
  });
};
