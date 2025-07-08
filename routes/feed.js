const express = require("express");
const { body } = require("express-validator");

const feedController = require("../controllers/feed");
const isAuthMiddleware = require("../middleware/is-auth");

const router = express.Router();

router.get("/posts", isAuthMiddleware, feedController.getPosts);
router.post(
  "/post",
  isAuthMiddleware,
  [
    body("title").trim().isLength({ min: 5 }),
    body("content").trim().isLength({ min: 5 }),
  ],
  feedController.createPost
);

router.get("/post/:postId", isAuthMiddleware, feedController.getPost);
router.put(
  "/post/:postId",
  isAuthMiddleware,
  [
    body("title").trim().isLength({ min: 5 }),
    body("content").trim().isLength({ min: 5 }),
  ],
  feedController.updatePost
);

router.delete("/post/:postId", isAuthMiddleware, feedController.deletePost);

module.exports = router;
