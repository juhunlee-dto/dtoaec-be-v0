const mongoose = require("mongoose");
const Joi = require("joi");

const contentOptions = {
  discriminatorKey: "contentType",
  timestamps: true
};
const contentStatus = ["Editing", "Pending", "Published"];

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
    contentBlocks: {
      type: [mongoose.SchemaTypes.ObjectId],
      ref: "ContentBlock",
      default: []
    },
    interactions: {
      type: [mongoose.SchemaTypes.ObjectId],
      ref: "UserInteraction",
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
      }
    }
  },
  contentOptions
);

contentSchema.methods.toJSON = function() {
  var obj = this.toObject();
  delete obj.opinions;
  return obj;
};

contentSchema.methods.updateMetadata = async function() {
  const ints = await Content.find({ _id: { $in: this.interactions } });
  for (let i of ints) {
  }
  //too expensive
};

const Content = mongoose.model("Content", contentSchema);

//only validate req from client
const joiSchema = {
  status: Joi.string()
    .required()
    .valid(contentStatus)
    .default("Editing"),
  author: Joi.objectId().required()
};

module.exports.contentJoiSchema = joiSchema;
module.exports.contentSchemaOptions = contentOptions;
module.exports.Content = Content;

// contentSchema.methods.opinionIndexOf = function(req) {
//   const user_m_id = mongoose.Types.ObjectId(req.user._id);
//   return _.findIndex(this.opinions, ["user", user_m_id]);
// };

// contentSchema.methods.isOpinionIdentical = function(index, req) {
//   return this.opinions[index].opinion === req.body.opinion;
// };

// contentSchema.methods.setOpinion = function(req) {
//   this.opinions.push({
//     user: mongoose.Types.ObjectId(req.user._id),
//     opinion: req.body.opinion
//   });
//   this.updateOpinionMetadata(req.body.opinion);
// };

// contentSchema.methods.updateOpinion = function(index, req) {
//   this.opinions[index].opinion = req.body.opinion;
//   this.updateOpinionMetadata(req.body.opinion);
// };

// contentSchema.methods.updateOpinionMetadata = function() {
//   this.metadata.usefulCount = 0;
//   this.metadata.notUsefulCount = 0;
//   for (let i = 0; i < this.opinions.length; ++i) {
//     const o = this.opinions[i];
//     if (o.opinion === "Useful") this.metadata.usefulCount++;
//     else if (o.opinion === "NotUseful") this.metadata.notUsefulCount++;
//   }
// };
