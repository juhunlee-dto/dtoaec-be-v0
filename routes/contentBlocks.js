const express = require("express");
const router = express.Router();
const validateObjectId = require("../middlewares/validateObjectId");
const validateContentBlock = require("../middlewares/validateContentBlock");
const auth = require("../middlewares/auth");
const admin = require("../middlewares/admin");
const { ContentBlock } = require("../models/contentBlock");
const { TextBlock } = require("../models/textBlock");
const { ImageBlock } = require("../models/imageBlock");
const { VideoBlock } = require("../models/videoBlock");
const _ = require("lodash");

router.post("/", [auth], async (req, res) => {
  return res.status(200).send("ok");
});

// router.post("/", [auth, validateContentBlock], async (req, res) => {
//   let contentBlock = getCorrectContentBlock(req);
//   if (!contentBlock) return res.status(400).send("Bad Content Block Request");
//   await contentBlock.save();
//   await contentBlock
//     .populate({
//       path: "parent"
//     })
//     .execPopulate();

//   return res.status(200).send(contentBlock);
// });

// router.get("/author/:id", [validateObjectId], async (req, res) => {
//   return res.status(200).send("ok");
// });

module.exports = router;

function getCorrectContentBlock(req) {
  const { contentType } = req.body;
  const obj = _.omit(req.body, ["contentType"]);
  if (!contentType) return null;

  let contentBlock;
  if (contentType === "Text") {
    contentBlock = new TextBlock(obj);
  } else if (contentType === "Image") {
    contentBlock = new ImageBlock(obj);
  } else if (contentType === "Video") {
    contentBlock = new VideoBlock(obj);
  }
  return contentBlock;
}
