const mongoose = require("mongoose");
const Joi = require("joi");
const {
  ContentBlock,
  contentBlockSchemaOptions,
  contentBlockJoiSchema
} = require("./contentBlock");

const ImageBlockSchema = new mongoose.Schema(
  {
    imageURL: {
      type: String,
      required: true,
      min: 2
    },
    description: {
      type: String,
      default: ""
    }
  },
  contentBlockSchemaOptions
);

const ImageBlock = ContentBlock.discriminator("ImageBlock", ImageBlockSchema);

function validateImageBlock(obj) {
  const schema = contentBlockJoiSchema.append({
    imageURL: Joi.string()
      .uri()
      .trim()
      .required(),
    description: Joi.string()
  });
  return Joi.validate(obj, schema, {
    allowUnknown: false
  });
}

module.exports.validateImageBlock = validateImageBlock;
module.exports.ImageBlock = ImageBlock;
