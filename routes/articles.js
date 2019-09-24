const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const validateObjectId = require("../middlewares/validateObjectId");
const auth = require("../middlewares/auth");
const validateReq = require("../middlewares/validateReq");
const { Article, validateArticle } = require("../models/article");
const { validateOpinion } = require("../models/opinion");

router.put("/:id/userInteractions", [auth], async (req, res) => {
  return res.status(200).send("ok");
});

module.exports = router;

// router.post("/", [auth, validateReq(validateArticle)], async (req, res) => {
//   let article = new Article(req.body);
//   await article.save();
//   await article
//     .populate({
//       path: "author",
//       model: "User",
//       select: ["lastName", "firstName"]
//     })
//     .execPopulate();
//   return res.status(200).send(article);
// });

// router.put(
//   "/:id",
//   [auth, validateObjectId, validateReq(validateArticle)],
//   async (req, res) => {
//     const article = await Article.findByIdAndUpdate(
//       req.params.id,
//       {
//         title: req.body.title,
//         subTitle: req.body.subTitle,
//         status: req.body.status
//       },
//       { new: true }
//     );
//     if (!article)
//       return res.status(404).send("Not Found: No article was found");
//     if (!article.author.equals(req.user._id))
//       return res.status(403).send("Not authorized: Not the author");
//     return res.status(200).send(article);
//   }
// );

// router.put(
//   "/:id/opinions",
//   [auth, validateObjectId, validateReq(validateOpinion)],
//   async (req, res) => {
//     const article = await Article.findById(req.params.id);
//     if (!article)
//       return res.status(404).send("Not Found: No article was found");
//     if (article.author.equals(req.user._id))
//       return res
//         .status(403)
//         .send("Not authorized: Author is not allowed to opine");
//     if (article.status !== "Published")
//       return res
//         .status(400)
//         .send("Bad Request: The article is not in published status");

//     //opinion operations
//     const oIndex = article.opinionIndexOf(req);
//     if (oIndex < 0) {
//       //new opinion
//       article.setOpinion(req);
//     } else {
//       if (article.isOpinionIdentical(oIndex, req)) {
//         //bad request
//         return res
//           .status(400)
//           .send("Bad Request: Cannot opine in the same way");
//       } else {
//         //update
//         article.updateOpinion(oIndex, req);
//       }
//     }
//     await article.save();
//     return res.status(200).send(article);
//   }
// );

// router.get("/:id", [validateObjectId], async (req, res) => {
//   const article = await Article.findById(req.params.id);
//   if (!article) return res.status(404).send("Not Found: No article was found");
//   return res.status(200).send(article);
// });
