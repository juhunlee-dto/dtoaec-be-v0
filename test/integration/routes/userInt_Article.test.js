process.env.NODE_ENV = "test";

const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("./../../../index");
const should = chai.should();
chai.use(chaiHttp);

const ContentGenerator = require("./../../../utils/contentGenerator");
const _ = require("lodash");
const mongoose = require("mongoose");
const { User } = require("./../../../models/user");
const {
  UserInteraction,
  userInteractionTypes
} = require("./../../../models/userInteraction");
const { Article } = require("./../../../models/article");
const { Content } = require("./../../../models/content");

describe("User Interaction with an Article", () => {
  const contGen = new ContentGenerator();
  let author_db;
  let author_token;
  let readers_int = [];
  let readers_db = [];
  let readers_token = [];
  let c_interactions_db = [];
  let cb_interactions_db = [];
  let article_db;

  const genUsersDB = async () => {
    author_db = contGen.generateUserModel("author1", true);
    await author_db.encryptPassword();
    author_token = author_db.generateUserAuthToken();
    await author_db.save();

    for (let i = 0; i < 5; ++i) {
      const r = contGen.generateUserModel(`reader${i}`, false);
      await r.encryptPassword();
      readers_token.push(r.generateUserAuthToken());
      readers_db.push(r);
      readers_int.push(_.sample(userInteractionTypes));
    }
    await User.insertMany(readers_db);
  };

  const genUserInteractionsDB = async (c_id, c_type, i_types, readers) => {
    let ints = [];
    for (const [i, r] of readers.entries()) {
      const itr = contGen.generateUserInteractionModel(
        r._id.toHexString(),
        i_types[i],
        c_id,
        c_type
      );
      ints.push(itr);
    }
    await UserInteraction.insertMany(ints);
    return ints;
  };

  const genArticleDB = async () => {
    const article_db_id = mongoose.Types.ObjectId().toHexString();
    let article_req = contGen.generateArticleReq(author_db._id.toHexString());
    article_req._id = article_db_id;
    article_req.status = "Published";

    c_interactions_db = await genUserInteractionsDB(
      article_db_id,
      "Article",
      ["ContentView", "ContentView", "ContentView", "Useful", "NotUseful"],
      readers_db
    );
    article_req.interactions = c_interactions_db.map(it_db => {
      return it_db._id;
    });

    article_db = new Article(article_req);
    await article_db.save();

    //
    // await article_db
    //   .populate({
    //     path: "interactions",
    //     model: "UserInteraction",
    //     select: ["interactedWith", "interactedWithType", "interactionType"]
    //   })
    //   .execPopulate();
    // const intCont = await UserInteraction.findById(
    //   article_db.interactions[0]
    // );
    // const cont = await Content.findById(intCont.interactedWith);
    // console.log(cont);
    console.log(article_db);
  };

  beforeEach(async () => {
    await User.deleteMany({});
    await genUsersDB();
    await genArticleDB();
  });

  afterEach(async () => {
    await Article.deleteMany({});
    await User.deleteMany({});
    await UserInteraction.deleteMany({});
  });

  describe("PUT / Update userInteractions with an article", () => {
    let param = "";
    let token_user;
    let postReq;
    const execute = () => {
      return chai
        .request(server)
        .put(`/api/articles/${param}/userInteractions`)
        .set("x-auth-token", token_user)
        .send(postReq);
    };

    beforeEach(async () => {
      param = article_db._id;
      token_user = readers_token[0];
      postReq = {};
    });

    afterEach(async () => {});

    it("should return 200", async () => {
      const res = await execute();
      res.should.have.status(200);
    });
  });
});
