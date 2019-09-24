const mongoose = require("mongoose");
const Joi = require("joi");

const userInteractionTypes = [
  "ContentView",
  "Useful",
  "NotUseful",
  "PremiumView",
  "AdsClick"
];

//make sure this is one of model name
const interactedContentTypes = ["Article"];

const userInteractionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      required: true,
      ref: "User"
    },
    interactionType: {
      type: String,
      required: true,
      enum: userInteractionTypes
    },
    interactedWith: {
      type: mongoose.SchemaTypes.ObjectId,
      required: true
    },
    interactedWithType: {
      type: String,
      required: true,
      enum: interactedContentTypes
    },
    metadata: {}
  },
  { timestamps: true }
);

function validateUserInteraction(obj) {
  const schema = {
    interactionType: Joi.string()
      .required()
      .valid(userInteractionTypes),
    interactedWith: Joi.ObjectId().required(),
    interactedWithType: Joi.string()
      .required()
      .valid(interactedContentTypes)
  };
  return Joi.validate(obj, schema, {
    allowUnknown: false
  });
}

const UserInteraction = mongoose.model(
  "UserInteraction",
  userInteractionSchema
);

module.exports.userInteractionTypes = userInteractionTypes;
module.exports.UserInteraction = UserInteraction;
module.exports.validateUserInteraction = validateUserInteraction;

//UserInteraction
//1. content view
//2. opinion to content
//3. preminum content block view
//4. opinion to premium content
//5. ads clicked
