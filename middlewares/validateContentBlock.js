const winston = require("winston");
const { validateContentBlock } = require("../models/contentBlock");
const { validateTextBlock } = require("../models/textBlock");
const { validateImageBlock } = require("../models/imageBlock");
const { validateVideoBlock } = require("../models/videoBlock");

module.exports = function(req, res, next) {
  const { contentType } = req.body;
  if (!contentType || ["Text", "Image", "Video"].indexOf(contentType) < 0) {
    const errMessage = `Invalid Content Type: ${contentType}`;
    winston.error(errMessage);
    return res.status(400).send(errMessage);
  }
  let result;
  if (contentType === "Text") {
    result = validateTextBlock(req.body);
  } else if (contentType === "Image") {
    result = validateImageBlock(req.body);
  } else if (contentType === "Video") {
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
