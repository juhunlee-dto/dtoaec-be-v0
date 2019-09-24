const mongoose = require("mongoose");
const Joi = require("joi");
const {
  Content,
  contentSchemaOptions,
  contentJoiSchema
} = require("./content");

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      max: 300,
      default: ""
    },
    subTitle: {
      type: String,
      max: 500,
      default: ""
    },
    metadata: {}
  },
  contentSchemaOptions
);

const Article = Content.discriminator("Article", articleSchema);

function validateArticle(obj) {
  const schema = contentJoiSchema.append({
    title: Joi.string()
      .allow("")
      .max(300)
      .default(""),
    subTitle: Joi.string()
      .allow("")
      .max(500)
      .default("")
  });
  return Joi.validate(obj, schema, {
    allowUnknown: false
  });
}

module.exports.validateArticle = validateArticle;
module.exports.Article = Article;

// articleSchema.statics.getArticleFromReq = function(req) {};

// articleSchema.methods.toJSON = function() {
//   var obj = this.toObject();
//   delete obj.opinions;
//   return obj;
// };

// articleSchema.methods.opinionIndexOf = function(req) {
//   const user_m_id = mongoose.Types.ObjectId(req.user._id);
//   return _.findIndex(this.opinions, ["user", user_m_id]);
// };

// articleSchema.methods.isOpinionIdentical = function(index, req) {
//   return this.opinions[index].opinion === req.body.opinion;
// };

// articleSchema.methods.setOpinion = function(req) {
//   this.opinions.push({
//     user: mongoose.Types.ObjectId(req.user._id),
//     opinion: req.body.opinion
//   });
//   this.updateOpinionMetadata(req.body.opinion);
// };

// articleSchema.methods.updateOpinion = function(index, req) {
//   this.opinions[index].opinion = req.body.opinion;
//   this.updateOpinionMetadata(req.body.opinion);
// };

// articleSchema.methods.updateOpinionMetadata = function() {
//   this.metadata.usefulCount = 0;
//   this.metadata.notUsefulCount = 0;
//   for (let i = 0; i < this.opinions.length; ++i) {
//     const o = this.opinions[i];
//     if (o.opinion === "Useful") this.metadata.usefulCount++;
//     else if (o.opinion === "NotUseful") this.metadata.notUsefulCount++;
//   }
// };

// const Article = mongoose.model("Article", articleSchema);

// function validateArticle(obj) {
//   const schema = {
//     title: Joi.string()
//       .allow("")
//       .max(300)
//       .default(""),
//     subTitle: Joi.string()
//       .allow("")
//       .max(500)
//       .default(""),
//     status: Joi.string()
//       .required()
//       .valid(articleStatus)
//       .default("Edit"),
//     author: Joi.objectId().required(),
//     contentBlocks: Joi.array()
//       .default([])
//       .items(Joi.objectId())
//   };

//   return Joi.validate(obj, schema, {
//     allowUnknown: false
//   });
// }

// module.exports.articleDefaultMetaData = articleDefaultMetaData;
// module.exports.validateArticle = validateArticle;
// module.exports.ArticleSchemaOptions = articleOptions;
// module.exports.Article = Article;
