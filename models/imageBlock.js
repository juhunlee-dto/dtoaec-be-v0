const mongoose = require("mongoose");
const Joi = require("joi");
const { ContentBlock, contentBlockSchemaOptions } = require("./contentBlock");

const ImageBlockSchema = new mongoose.Schema(
  {
    imageURL: {
      type: String,
      min: 2
    }
  },
  contentBlockSchemaOptions
);

const ImageBlock = ContentBlock.discriminator("ImageBlock", ImageBlockSchema);

function validateImageBlock(obj) {
  const schema = {
    imageURL: Joi.string()
      .uri()
      .trim()
      .required()
  };
  return Joi.validate(obj, schema, {
    allowUnknown: true
  });
}

module.exports.validateImageBlock = validateImageBlock;
module.exports.ImageBlock = ImageBlock;
