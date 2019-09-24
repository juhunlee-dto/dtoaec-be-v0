const mongoose = require("mongoose");
const Joi = require("joi");

const opinions = ["Useful", "NotUseful"];

const opinionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      required: true
    },
    opinion: {
      type: String,
      required: true,
      enum: opinions
    }
  },
  { _id: false, timestamps: true }
);

function validateOpinion(obj) {
  const schema = {
    opinion: Joi.string()
      .required()
      .valid(opinions)
  };

  return Joi.validate(obj, schema, {
    allowUnknown: false
  });
}

module.exports.opinionSchema = opinionSchema;
module.exports.validateOpinion = validateOpinion;
