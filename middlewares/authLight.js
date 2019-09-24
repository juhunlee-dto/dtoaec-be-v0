const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = function(req, res, next) {
  const token = req.header("x-auth-token");
  if (token) {
    try {
      const decoded = jwt.verify(token, config.get("DTO_JWT_PrivateKey"));
      req.user = decoded; //setting user here
      next();
    } catch (ex) {
      return res.status(400).send("Invalid token.");
    }
  } else {
    next();
  }
};
