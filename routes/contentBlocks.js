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

router.post("/", [auth, validateContentBlock], async (req, res) => {
  //get article
  //add conBlock
  req.body.author = req.user._id;
  const conBlock = new ContentBlock(req.body);
  await conBlock.save();
  await conBlock
    .populate({
      path: "parent"
    })
    .execPopulate();
  return res.status(200).send(conBlock);
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
