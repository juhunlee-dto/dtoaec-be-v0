const mongoose = require("mongoose");
const Joi = require("joi");
const { userInteractionSchema } = require("./userInteraction");

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
    parent: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Content",
      require: true
    },
    userInteractions: {
      type: [userInteractionSchema],
      default: []
    },
    metadata: {
      usefulCount: {
        type: Number,
        default: 0
      },
      notUsefulCount: {
        type: Number,
        default: 0
      },
      viewCount: {
        type: Number,
        default: 0
      },
      premiumViewCount: {
        type: Number,
        default: 0
      },
      adsClickCount: {
        type: Number,
        default: 0
      }
    }
  },
  contentBlockOptions
);

const ContentBlock = mongoose.model("ContentBlock", contentBlockSchema);

//no content id from req as it should be assigned in the server
const joiSchema = Joi.object().keys({
  isPremium: Joi.boolean().required(),
  parent: Joi.objectId().required(),
  contentType: Joi.string().required()
});

module.exports.contentBlockJoiSchema = joiSchema;
module.exports.contentBlockSchemaOptions = contentBlockOptions;
module.exports.ContentBlock = ContentBlock;
