const express = require("express");
const error = require("../middlewares/error");
const users = require("../routes/users");
const articles = require("../routes/articles");
const contentBlocks = require("../routes/contentBlocks");

module.exports = function(app) {
  app.use(express.json());
  app.use("/api/users", users);
  app.use("/api/articles", articles);
  app.use("/api/contentBlocks", contentBlocks);
  app.use(error);
};
