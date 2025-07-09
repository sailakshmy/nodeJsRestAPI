const path = require("path");
const fs = require("fs");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const multer = require("multer");
const { graphqlHTTP } = require("express-graphql");

// const feedRoutes = require("./routes/feed");
// const authRoutes = require("./routes/auth");

const graphqlSchema = require("./graphql/schema");
const graphqlResolver = require("./graphql/resolvers");

const isAuthMiddleware = require("./middleware/is-auth");

const app = express();

app.use(bodyParser.json());

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/jpg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.use(
  multer({
    storage: fileStorage,
    fileFilter,
  }).single("image")
);
app.use("/images", express.static(path.join(__dirname, "images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// app.use("/feed", feedRoutes);
// app.use("/auth", authRoutes);

app.use(isAuthMiddleware);

const clearImage = (filePath) => {
  console.log("filePath before", filePath);
  filePath = path.join(__dirname, "..", filePath);
  console.log("FilePath after", filePath);
  fs.unlink(filePath, (err) => {
    if (err) {
      console.log("filePath", filePath);
      console.log("Error while clearing the image", err);
    }
  });
};

app.put("/post-image", (req, res, next) => {
  if (!req.isAuth) {
    throw new Error("Not Authenticated");
  }
  if (!req.file) {
    return res.status(200).json({ message: "No file provided!" });
  }
  if (req.body.oldPath) {
    clearImage(req.body.oldPath);
  }
  return res
    .status(201)
    .json({ message: "File stored!", filePath: req.file.path });
});

app.use(
  "/graphql",
  graphqlHTTP({
    schema: graphqlSchema,
    rootValue: graphqlResolver,
    graphiql: true,
    formatError(err) {
      if (!err.originalError) {
        return err;
      }
      const data = err.originalError.data;
      const message = err.message ?? "An error occurred";
      const code = err.originalError.code ?? 500;
      return {
        message,
        code,
        data,
      };
    },
  })
);

app.use((error, req, res, next) => {
  console.log("Error", error);
  const statusCode = error.statusCode || 500;
  const { message } = error;
  const data = error?.data;
  res.status(statusCode).json({ message, data });
});

const uri =
  "mongodb+srv://Groot:IAmGroot@cluster0.2ehxgue.mongodb.net/messages?retryWrites=true&w=majority&appName=Cluster0";

mongoose
  .connect(uri)
  .then(() => {
    app.listen(8080);
    // const noderserver = app.listen(8080);
    // const io = require("./socket").init(noderserver);
    // io.on("connection", (socket) => {
    //   console.log("Client connected", socket);
    // });
  })
  .catch((e) => console.log("error while connecting to mongoose", e));
