const mongoose = require("mongoose");
const Joi = require("joi");
const _ = require("lodash");

const opinions = ["Useful", "NotUseful", "Withdraw"];

const opinionSchema = new mongoose.Schema(
  {
    by: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      required: true
    },
    opinion: {
      type: String,
      required: true,
      enum: opinions
    },
    comment: {
      type: String,
      maxlength: 200,
      default: ""
    }
  },
  { _id: false, timestamps: true }
);

function validateOpinion(obj) {
  const schema = {
    opinion: Joi.string()
      .required()
      .valid(opinions),
    comment: Joi.string()
      .max(200)
      .default("")
  };
  return Joi.validate(obj, schema, {
    allowUnknown: false
  });
}

module.exports.opinionSchema = opinionSchema;
module.exports.validateOpinion = validateOpinion;

module.exports.OpinionHandler = obj => {
  obj.methods._opinionIndexOf = function(user) {
    const user_m_id = mongoose.Types.ObjectId(user._id);
    return _.findIndex(this.opinions, ["by", user_m_id]);
  };

  obj.methods._removeOpinion = function(user) {
    const oIndex = this._opinionIndexOf(user);
    const prevOpinion = this.opinions[oIndex].opinion;
    this.opinions.splice(oIndex, 1);
    this.updateMetadata(prevOpinion, -1);
  };

  obj.methods._setOpinion = function(user, opinion, comment) {
    if (opinion === "Withdraw") return;
    this.opinions.push({
      by: mongoose.Types.ObjectId(user._id),
      opinion: opinion,
      comment: comment
    });
    this.updateMetadata(opinion);
  };

  obj.methods._isOpinionIdentical = function(index, opinion) {
    return this.opinions[index].opinion === opinion;
  };

  obj.methods._updateOpinion = function(index, opinion, comment = "") {
    this.opinions[index].opinion = opinion;
    this.opinions[index].comment = comment;
    this.updateMetadata(opinion);
  };

  obj.methods.opinedBy = function(user, opinion, comment = "") {
    if (this.author.equals(user._id)) return 403;
    const oIndex = this._opinionIndexOf(user);
    if (oIndex < 0) {
      //new opinion
      this._setOpinion(user, opinion, comment);
    } else {
      if (opinion === "Withdraw") {
        this._removeOpinion(user);
      } else {
        if (this._isOpinionIdentical(oIndex, opinion)) {
          //bad request
          return 400;
        } else {
          //update
          this._updateOpinion(oIndex, opinion, comment);
        }
      }
    }
    return 200;
  };
};
