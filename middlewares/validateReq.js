const winston = require("winston");
module.exports = validator => {
  return (req, res, next) => {
    const { error } = validator(req.body);
    if (error) {
      winston.error(`${validator.name}: ${error.details[0].message}`);
      return res.status(400).send(error.details[0].message);
    }
    next();
  };
};
