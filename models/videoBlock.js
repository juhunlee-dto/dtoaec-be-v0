const mongoose = require("mongoose");
const Joi = require("joi");
const {
  ContentBlock,
  contentBlockSchemaOptions,
  contentBlockJoiSchema
} = require("./contentBlock");

const VideoBlockSchema = new mongoose.Schema(
  {
    videoURL: {
      type: String,
      min: 2
    },
    description: {
      type: String,
      default: ""
    }
  },
  contentBlockSchemaOptions
);

const VideoBlock = ContentBlock.discriminator("VideoBlock", VideoBlockSchema);

function validateVideoBlock(obj) {
  const schema = contentBlockJoiSchema.append({
    videoURL: Joi.string()
      .uri()
      .trim()
      .required(),
    description: Joi.string()
  });
  return Joi.validate(obj, schema, {
    allowUnknown: false
  });
}

module.exports.validateVideoBlock = validateVideoBlock;
module.exports.VideoBlock = VideoBlock;
