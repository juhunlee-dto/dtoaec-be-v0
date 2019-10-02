const winston = require("winston");
const { validateTextBlock } = require("../models/textBlock");
const { validateImageBlock } = require("../models/imageBlock");
const { validateVideoBlock } = require("../models/videoBlock");

module.exports = function(req, res, next) {
  const { contentType } = req.body;
  if (!contentType) {
    // || ["Text", "Image", "Video"].indexOf(contentType) < 0) {
    const errMessage = "ContentType is required";
    winston.error(errMessage);
    return res.status(400).send(errMessage);
  }
  let result;
  if (contentType === "TextBlock") {
    result = validateTextBlock(req.body);
  } else if (contentType === "ImageBlock") {
    result = validateImageBlock(req.body);
  } else if (contentType === "VideoBlock") {
    result = validateVideoBlock(req.body);
  }
  if (result.error) {
    winston.error(
      `Invalid ${contentType} Content: ${result.error.details[0].message}`
    );
    return res.status(400).send(result.error.details[0].message);
  }
  next();
};
