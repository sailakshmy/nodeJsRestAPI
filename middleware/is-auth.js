const jwt = require("jsonwebtoken");
const { JWT_SECRET_KEY } = require("../utils/constants");

module.exports = (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    const error = new Error("Not authenticated");
    error.statusCode = 401;
    throw error;
  }
  const token = authHeader.split(" ")?.[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, JWT_SECRET_KEY);
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
  if (!decodedToken) {
    const e = new Error("Not authenticated!");
    e.statusCode = 401;
    throw e;
  }
  req.userId = decodedToken.userId;
  next();
};
