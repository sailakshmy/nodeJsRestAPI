const path = require("path");
const fs = require("fs");

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

exports.clearImage = clearImage;
