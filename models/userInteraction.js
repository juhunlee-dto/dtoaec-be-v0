const mongoose = require("mongoose");

//make sure this is one of model name
const withModels = ["User", "Article", "TextBlock", "ImageBlock", "VideoBlock"];

const types = ["ContentView", "PremiumView", "AdsClick"];

const userInteractionSchema = new mongoose.Schema(
  {
    with: {
      type: mongoose.SchemaTypes.ObjectId,
      required: true,
      refPath: "interactions.withModel"
    },
    withModel: {
      type: String,
      required: true,
      enum: withModels
    },
    type: {
      type: String,
      required: true,
      enum: types
    },
    metadata: {}
  },
  { timestamps: true, _id: false }
);

module.exports.userInteractionSchema = userInteractionSchema;

//UserInteraction
//1. content view
//2. opinion to content
//3. preminum content block view
//4. opinion to premium content
//5. ads clicked
