const Joi = require("joi");
const winston = require("winston");
module.exports = function() {
  Joi.objectId = require("joi-objectid")(Joi); //why only need to import once here?... why not others?
  winston.info("joi object id validation imported.");
};
