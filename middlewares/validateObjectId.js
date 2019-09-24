const mongoose = require("mongoose");
const winston = require("winston");

module.exports = function(req, res, next) {
  for (const p in req.params) {
    if (p.includes("id")) {
      if (!mongoose.Types.ObjectId.isValid(req.params[p])) {
        winston.error(`Invalid objectId for ${p}: ${req.params[p]}`);
        return res
          .status(400)
          .send(`Bad Request: Invalid objectId for ${p}: ${req.params[p]}`);
      }
    }
  }
  next();
};
