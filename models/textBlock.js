const mongoose = require("mongoose");
const Joi = require("joi");
const {
  ContentBlock,
  contentBlockSchemaOptions,
  contentBlockJoiSchema
} = require("./contentBlock");

const textBlockSchema = new mongoose.Schema(
  {
    textContent: {
      type: String,
      min: 2
    }
  },
  contentBlockSchemaOptions
);
//need contentblock option??

const TextBlock = ContentBlock.discriminator("TextBlock", textBlockSchema);

function validateTextBlock(obj) {
  const schema = contentBlockJoiSchema.append({
    textContent: Joi.string()
      .min(2)
      .required()
  });
  return Joi.validate(obj, schema, {
    allowUnknown: false
  });
}

module.exports.validateTextBlock = validateTextBlock;
module.exports.TextBlock = TextBlock;
