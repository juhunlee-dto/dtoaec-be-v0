const mongoose = require("mongoose");
const Joi = require("joi");
const { ContentBlock, contentBlockSchemaOptions } = require("./contentBlock");

const TextBlockSchema = new mongoose.Schema(
  {
    textContent: {
      type: String,
      min: 2
    }
  },
  contentBlockSchemaOptions
);

const TextBlock = ContentBlock.discriminator("TextBlock", TextBlockSchema);

function validateTextBlock(obj) {
  const schema = {
    textContent: Joi.string()
      .min(2)
      .required()
  };
  return Joi.validate(obj, schema, {
    allowUnknown: true
  });
}

module.exports.validateTextBlock = validateTextBlock;
module.exports.TextBlock = TextBlock;
