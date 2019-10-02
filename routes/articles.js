const express = require("express");
const router = express.Router();
const validateObjectId = require("../middlewares/validateObjectId");
const auth = require("../middlewares/auth");
const authLight = require("../middlewares/authLight");
const validateReq = require("../middlewares/validateReq");
const rejectReqBody = require("../middlewares/rejectBody");
const validatePaginateQuery = require("../middlewares/validatePaginationQuery");
const { Article, validateArticle } = require("../models/article");
const { User } = require("../models/user");
const { validateOpinion } = require("../models/opinion");

router.post("/my", [auth, validateReq(validateArticle)], async (req, res) => {
  req.body.author = req.user._id;
  let article = new Article(req.body);
  await article.save();
  return res.status(200).send(article.toJsonSimple());
});

router.put(
  "/my/:id",
  [auth, validateObjectId, validateReq(validateArticle)],
  async (req, res) => {
    const article = await Article.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        subTitle: req.body.subTitle,
        status: req.body.status
      },
      { new: true }
    );
    if (!article)
      return res.status(404).send("Not Found: No article was found");
    if (!article.author.equals(req.user._id))
      return res.status(403).send("Not authorized: Not the author");
    return res.status(200).send(article.toJsonSimple());
  }
);

router.put(
  "/:id/opine",
  [auth, validateObjectId, validateReq(validateOpinion)],
  async (req, res) => {
    const article = await Article.findOne({
      _id: req.params.id,
      status: "Published"
    });
    if (!article)
      return res.status(404).send("Not Found: No article was found");

    //opinion operations
    const st = article.opinedBy(req.user, req.body.opinion, req.body.comment);
    if (st === 403) {
      return res
        .status(403)
        .send("Not authorized: Author is not allowed to opine");
    }
    if (st === 400) {
      return res.status(400).send("Bad Request: Cannot opine in the same way");
    }
    await article.save();

    //console.log(article);
    return res.status(200).send(article);
  }
);

router.get(
  "/my",
  [rejectReqBody, auth, validatePaginateQuery],
  async (req, res) => {
    const pageOptions = {
      page: parseInt(req.query.page) || 0,
      limit: parseInt(req.query.limit) || 5
    };
    const articles = await Article.find({
      author: req.user._id
    })
      .sort({ updatedAt: "desc" })
      .skip(pageOptions.page * pageOptions.limit)
      .limit(pageOptions.limit)
      .select(["-opinions", "-interactions"])
      .exec();
    return res.status(200).send(articles);
  }
);

router.get(
  "/author/:id",
  [rejectReqBody, validateObjectId, authLight, validatePaginateQuery],
  async (req, res) => {
    const pageOptions = {
      page: parseInt(req.query.page) || 0,
      limit: parseInt(req.query.limit) || 5
    };
    const articles = await Article.find({
      author: req.params.id,
      status: "Published"
    })
      .sort({ updatedAt: "desc" })
      .skip(pageOptions.page * pageOptions.limit)
      .limit(pageOptions.limit)
      .select(["-opinions", "-interactions", "-contentBlocks"])
      .exec();
    //no contentblock as this is not for actual view
    return res.status(200).send(articles);
  }
);

router.get(
  "/:id/view",
  [rejectReqBody, validateObjectId, authLight],
  async (req, res) => {
    let article = await Article.findOne({
      _id: req.params.id,
      status: "Published"
    });
    if (!article)
      return res.status(404).send("Not Found: No article was found");

    if (!req.user) {
      article.metadata.anoViewCount++;
    } else {
      let reader = await User.findById(req.user._id);
      if (!reader._id.equals(article.author)) {
        article.interactedBy(reader, "ContentView");
        await reader.save();
        await article.save();
      }
    }
    return res.status(200).send(article.toJsonSimple());
  }
);

router.delete(
  "/my/:id",
  [rejectReqBody, validateObjectId, auth],
  async (req, res) => {
    // await Article.findOneAndDelete({
    //   _id: req.params.id,
    //   author: req.user._id
    // });
    let article = await Article.findById(req.params.id);
    if (!article)
      return res.status(404).send("Not Found: No article was found");
    if (article.author.equals(req.user._id)) {
      await article.remove();
      //How to delete all dependencies?? like contentblock?
    } else {
      return res.status(403).send("Not authorized: Not the author");
    }
    return res.status(200).send("deleted");
  }
);

module.exports = router;
