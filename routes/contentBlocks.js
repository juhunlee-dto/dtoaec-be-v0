const express = require("express");
const router = express.Router();
const validateObjectId = require("../middlewares/validateObjectId");
const validateContentBlock = require("../middlewares/validateContentBlock");
const auth = require("../middlewares/auth");
const admin = require("../middlewares/admin");
const { Content } = require("../models/content");
const { ContentBlock } = require("../models/contentBlock");
const { TextBlock } = require("../models/textBlock");
const { ImageBlock } = require("../models/imageBlock");
const dot = require("dot-object");
const _ = require("lodash");

router.post("/", [auth, validateContentBlock], async (req, res) => {
  const cont = await Content.findById(req.body.parent);
  if (!cont) return res.status(404).send("Parent Content Not Found");
  if (!cont.author.equals(req.user._id))
    return res.status(403).send("Not authorized: Not the author");

  req.body.author = req.user._id;
  const conBlock = new ContentBlock(req.body);
  await conBlock.save();
  cont.contentBlocks.push(conBlock._id);
  await cont.save();
  // await conBlock
  //   .populate({
  //     path: "parent"
  //   })
  //   .execPopulate();
  return res.status(200).send(conBlock);
});

router.put("/:id", [auth, validateContentBlock], async (req, res) => {
  const cont = await Content.findById(req.body.parent);
  if (!cont) return res.status(404).send("Parent Content Not Found");
  if (!cont.author.equals(req.user._id))
    return res.status(403).send("Not authorized: Not the author");

  const model = GetCorrectModel(req);
  delete req.body.parent;
  delete req.body.contentType;
  const updateObj = dot.dot(req.body);
  const conBlock = await model.findByIdAndUpdate(req.params.id, updateObj, {
    new: true
  });
  if (!conBlock) return res.status(404).send("Content Block Not Found");

  return res.status(200).send(conBlock);
});

module.exports = router;

function GetCorrectModel(req) {
  const { contentType } = req.body;
  let model;
  switch (contentType) {
    case "TextBlock":
      model = TextBlock;
      break;
    case "ImageBlock":
      model = ImageBlock;
      break;
    default:
      model = ContentBlock;
      break;
  }
  return model;
}
