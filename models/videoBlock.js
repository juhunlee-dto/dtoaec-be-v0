const mongoose = require("mongoose");
const Joi = require("joi");
const { ContentBlock, contentBlockSchemaOptions } = require("./contentBlock");

const VideoBlockSchema = new mongoose.Schema(
  {
    videoURL: {
      type: String,
      min: 2
    }
  },
  contentBlockSchemaOptions
);

const VideoBlock = ContentBlock.discriminator("VideoBlock", VideoBlockSchema);

function validateVideoBlock(obj) {
  const schema = {
    videoURL: Joi.string()
      .uri()
      .trim()
      .required()
  };
  return Joi.validate(obj, schema, {
    allowUnknown: true
  });
}

module.exports.validateVideoBlock = validateVideoBlock;
module.exports.VideoBlock = VideoBlock;
