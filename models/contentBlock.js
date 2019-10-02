const mongoose = require("mongoose");
const Joi = require("joi");
const { userInteractionSchema } = require("./userInteraction");
const { opinionSchema, OpinionHandler } = require("./opinion");

const contentBlockOptions = {
  discriminatorKey: "contentType",
  timestamps: true
};

//discriminatorkey??? or refPath???

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
    },
    parent: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Content",
      require: true
    },
    opinions: [
      {
        type: opinionSchema
      }
    ],
    interactions: [
      {
        type: userInteractionSchema
      }
    ],
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

contentBlockSchema.methods.interactedBy = function(user, type) {
  this.interactions.push({
    with: user._id,
    withModel: "User",
    type: type
  });
  this.updateMetadata(type);

  user.interactions.push({
    with: this._id,
    withModel: this.constructor.modelName,
    type: type
  });
  user.updateMetadata(type);
};

OpinionHandler(contentBlockSchema);

contentBlockSchema.methods.updateMetadata = function(type, val = 1) {
  if (type === "ContentView") {
    this.metadata.viewCount += val;
  } else if (type === "PremiumView") {
    this.metadata.viewCount += val; //??
    this.metadata.premiumViewCount += val;
  } else if (type === "AdsClick") {
    this.metadata.adsClickCount += val;
  } else if (type === "Useful") {
    this.metadata.usefulCount += val;
  } else if (type === "NotUseful") {
    this.metadata.notUsefulCount += val;
  }
};

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
