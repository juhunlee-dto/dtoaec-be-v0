const winston = require("winston");

function isPositiveInteger(n) {
  return 0 === n % (!isNaN(parseFloat(n)) && 0 <= ~~n);
}

module.exports = function(req, res, next) {
  if (req.query) {
    if (req.query.page && !isPositiveInteger(req.query.page)) {
      const message = `Invalid page query string`;
      winston.error(message);
      return res.status(400).send(message);
    }
    if (req.query.limit && !isPositiveInteger(req.query.limit)) {
      const message = `Invalid limit query string`;
      winston.error(message);
      return res.status(400).send(message);
    }
  }
  next();
};
