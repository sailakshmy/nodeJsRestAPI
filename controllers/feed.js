exports.getPosts = (req, res, next) => {
  res.status(200).json({
    posts: [
      {
        title: "first post",
        content: "This is my first post",
      },
    ],
  });
};

exports.createPost = (req, res, next) => {
  const { title, content } = req.body;
  // Create a post in DB
  res.status(201).json({
    message: "Post created successfully!",
    post: {
      id: new Date().toISOString(),
      title,
      content,
    },
  });
};
