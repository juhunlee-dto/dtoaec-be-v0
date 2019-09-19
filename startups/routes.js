const express = require("express");
const error = require("../middlewares/error");
const users = require("../routes/users");
const contentBlocks = require("../routes/contentBlocks");

module.exports = function(app) {
  app.use(express.json());
  app.use("/api/users", users);
  app.use("/api/contentBlocks", contentBlocks);
  app.use(error);
};
