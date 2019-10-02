const mongoose = require("mongoose");
const Joi = require("joi");
const { userInteractionSchema } = require("./userInteraction");
const { opinionSchema, OpinionHandler } = require("./opinion");

const contentOptions = {
  discriminatorKey: "contentType",
  timestamps: true
};
const contentStatus = ["Editing", "Pending", "Published"];

//RETHINK Content Block
const contentSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
      default: "Editing",
      enum: contentStatus
    },
    author: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      require: true
    },
    contentBlocks: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "ContentBlock"
      }
    ],
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
      anoViewCount: {
        type: Number,
        default: 0
      }
    }
  },
  contentOptions
);

contentSchema.methods.toJsonSimple = function() {
  var obj = this.toObject();
  delete obj.opinions;
  delete obj.interactions;
  return obj;
};

contentSchema.methods.interactedBy = function(user, type) {
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

OpinionHandler(contentSchema);

contentSchema.methods.updateMetadata = function(type, val = 1) {
  if (type === "ContentView") {
    this.metadata.viewCount += val;
  } else if (type === "Useful") {
    this.metadata.usefulCount += val;
  } else if (type === "NotUseful") {
    this.metadata.notUsefulCount += val;
  }
};

const Content = mongoose.model("Content", contentSchema);

//only validate req from client
const joiSchema = Joi.object().keys({
  status: Joi.string()
    .required()
    .valid(contentStatus)
    .default("Editing")
});

module.exports.contentJoiSchema = joiSchema;
module.exports.contentSchemaOptions = contentOptions;
module.exports.Content = Content;
