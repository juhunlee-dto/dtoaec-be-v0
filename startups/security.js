const helmet = require("helmet");
const winston = require("winston");

module.exports = function(app) {
  //https://helmetjs.github.io/docs/
  winston.info(`enabling helmet`);
  app.use(helmet());
};
