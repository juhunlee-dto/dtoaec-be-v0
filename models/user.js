const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const config = require("config");
const Joi = require("joi");
const PasswordComplexity = require("joi-password-complexity");
const bcrypt = require("bcrypt");
const { userInteractionSchema } = require("./userInteraction");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 50
  },
  lastName: {
    type: String,
    require: true,
    minlength: 1,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    unique: true
  },
  password: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 1024
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  interactions: {
    type: [userInteractionSchema],
    default: []
  },
  metadata: {
    contentViewCount: {
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
});

userSchema.methods.generateUserAuthToken = function() {
  return jwt.sign(
    { _id: this._id, email: this.email, isAdmin: this.isAdmin },
    config.get("DTO_JWT_PrivateKey")
  );
};

userSchema.methods.encryptPassword = async function() {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
};

userSchema.methods.interactWith = function(content, type) {
  this.interactions.push({
    with: content._id,
    withModel: content.constructor.modelName,
    type: type
  });
  this.updateMetadata(type);

  content.interactions.push({
    with: this._id,
    withModel: "User",
    type: type
  });
  content.updateMetadata(type);
};

userSchema.methods.updateMetadata = function(type) {
  if (type === "ContentView") {
    this.metadata.contentViewCount++;
  } else if (type === "PremiumView") {
    this.metadata.contentViewCount++; //??
    this.metadata.premiumViewCount++;
  } else if (type === "AdsClick") {
    this.metadata.adsClickCount++;
  }
};

const User = mongoose.model("User", userSchema);

function getUserPasswordComplexityOptions() {
  return {
    min: 8,
    max: 30,
    lowerCase: 1,
    upperCase: 1,
    numeric: 1,
    symbol: 1,
    requirementCount: 3
  };
}

function validateUser(user) {
  const complexityOptions = getUserPasswordComplexityOptions();

  const schema = {
    firstName: Joi.string()
      .required()
      .min(1)
      .max(50),
    lastName: Joi.string()
      .required()
      .min(1)
      .max(50),
    email: Joi.string()
      .required()
      .min(5)
      .max(50)
      .email(),
    password: new PasswordComplexity(complexityOptions).required()
  };
  return Joi.validate(user, schema);
}

module.exports.User = User;
module.exports.getUserPasswordComplexityOptions = getUserPasswordComplexityOptions;
module.exports.validate = validateUser;
