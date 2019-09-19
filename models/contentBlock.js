const mongoose = require("mongoose");
const Joi = require("joi");
const _ = require("lodash");

const contentBlockOptions = {
  discriminatorKey: "contentType",
  timestamps: true
};
const contentBlockSchema = new mongoose.Schema(
  {
    isPremium: {
      type: Boolean,
      default: false,
      required: true
    },
    author: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      require: true
    }
  },
  contentBlockOptions
);

const ContentBlock = mongoose.model("ContentBlock", contentBlockSchema);

function validateContentBlock(obj) {
  const schema = {
    author: Joi.objectId().required(),
    isPremium: Joi.boolean().required(),
    contentType: Joi.string().required()
  };
  return Joi.validate(obj, schema, {
    allowUnknown: true
  });
}

module.exports.validateContentBlock = validateContentBlock;
module.exports.ContentBlockSchemaOptions = contentBlockOptions;
module.exports.ContentBlock = ContentBlock;
