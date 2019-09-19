const winston = require("winston");

module.exports = function(err, req, res, next) {
  winston.error(err.stack);
  //error
  //warn
  //info
  //verbose
  //debug
  //silly
  res.status(500).send("Internal Server Error");
};
