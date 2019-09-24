const winston = require("winston");
const express = require("express");
const app = express();

require("./startups/logging")();
require("./startups/joiObjIdValidation")();
//require("./startups/security")(app);
require("./startups/db")();
require("./startups/routes")(app);

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  winston.info(`listening on port ${port}`);
});

module.exports = server;
