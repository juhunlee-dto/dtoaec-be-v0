const winston = require("winston");
//require("winston-mongodb"); //for some reason this won't allow to do integration test
require("express-async-errors");

//error
//warn
//info
//verbose
//debug
//silly

module.exports = function() {
  const consoleFormat = {
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({
        format: "YYYY/MM/DD HH:mm:ss"
      }),
      winston.format.json(),
      winston.format.printf(info => `        - ${info.level}: ${info.message}`)
    )
  };

  // const files = new winston.transports.File({
  //   filename: "logfile.log",
  //   level: "error",
  //   format: winston.format.combine(
  //     winston.format.timestamp({
  //       format: "YYYY/MM/DD HH:mm:ss"
  //     }),
  //     winston.format.json(),
  //     winston.format.printf(
  //       info => `${info.timestamp}: ${info.level}: ${info.message}`
  //     )
  //   )
  // });
  // winston.add(files);

  const consoleLog = new winston.transports.Console(consoleFormat);
  winston.add(consoleLog);

  winston.exceptions.handle(new winston.transports.Console(consoleFormat));
  winston.exceptions.unhandle(new winston.transports.Console(consoleFormat));

  //unhandled rejection
  process.on("unhandledRejection", ex => {
    winston.error(`unhandled promise rejection: ${ex}`);
  });
};

// // winston.add(winston.transports.MongoDB, {
// //   db: "mongodb://localhost/vidly",
// //   level: "warn" //all this prop to error level
// // }); //this only works with winston-mongodb 3.0

//   // //node.js uncaughtException
//   // process.on("uncaughtException", ex => {
//   //   winston.error(ex.message, ex);
//   //   process.exit(1);
//   // });
//   // //node.js unhandledRejection to catch
//   // process.on("unhandledRejection", ex => {
//   //   winston.error(ex.message, ex);
//   //   process.exit(1);
//   // });
