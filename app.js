const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const multer = require("multer");
const { graphqlHTTP } = require("express-graphql");

// const feedRoutes = require("./routes/feed");
// const authRoutes = require("./routes/auth");

const graphqlSchema = require("./graphql/schema");
const graphqlResolver = require("./graphql/resolvers");

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
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// app.use("/feed", feedRoutes);
// app.use("/auth", authRoutes);

app.use(
  "/graphql",
  graphqlHTTP({
    schema: graphqlSchema,
    rootValue: graphqlResolver,
    graphiql: true,
  })
);

app.use((error, req, res, next) => {
  console.log("Error", error);
  const { statusCode, message } = error;
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
