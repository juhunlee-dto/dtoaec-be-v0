process.env.NODE_ENV = "test";
const { inspect } = require("util");
const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../../../index");
const should = chai.should();
const expect = chai.expect;
chai.use(require("chai-like"));
chai.use(require("chai-things")); // Don't swap these two
chai.use(chaiHttp);

const ContentGenerator = require("../../../utils/contentGenerator");
const mongoose = require("mongoose");
const { User } = require("../../../models/user");
const { Article } = require("./../../../models/article");
const { ContentBlock } = require("../../../models/contentBlock");

describe("CRUD Ops ContentBlock/ ~api/contentBlocks/", () => {
  const contGen = new ContentGenerator();
  let authors_db = [];
  let authors_token = [];
  let readers_db = [];
  let readers_token = [];
  let article;

  const genUsersDB = async (at_count, r_count) => {
    authors_db = [];
    authors_token = [];
    readers_db = [];
    readers_token = [];

    for (let i = 0; i < at_count; ++i) {
      const a = contGen.generateUserModel(`author${i}`);
      await a.encryptPassword();
      authors_token.push(a.generateUserAuthToken());
      authors_db.push(a);
    }

    for (let i = 0; i < r_count; ++i) {
      const r = contGen.generateUserModel(`reader${i}`);
      await r.encryptPassword();
      readers_token.push(r.generateUserAuthToken());
      readers_db.push(r);
    }
    await User.insertMany([...authors_db, ...readers_db]);
  };

  const genArticleDB = async author => {
    let article_req = contGen.generateArticleBase(author._id.toHexString());
    article_req.status = "Published";
    article = new Article(article_req);
    await article.save();
  };

  const appendContentBlocksDB = async (author, reader1, reader2) => {
    const txBlock = contGen.generateTextBlockModel(
      author._id,
      article._id,
      1,
      false
    );
    txBlock.interactedBy(reader1, "ContentView");
    txBlock.interactedBy(reader2, "ContentView");

    const imgBlock = contGen.generateImageBlockModel(
      author._id,
      article._id,
      true
    );
    imgBlock.interactedBy(reader1, "PremiumView");
    imgBlock.interactedBy(reader1, "AdsClick");
    imgBlock.opinedBy(reader1, "Useful", "Very Clear Diagram");

    imgBlock.interactedBy(reader2, "PremiumView");

    const txBlock2 = contGen.generateTextBlockModel(
      author._id,
      article._id,
      2,
      false
    );
    txBlock2.interactedBy(reader1, "ContentView");
    txBlock2.interactedBy(reader2, "ContentView");

    article.interactedBy(reader1, "ContentView");
    article.opinedBy(reader1, "Useful", "This is very good");
    article.interactedBy(reader2, "ContentView");

    await txBlock.save();
    await imgBlock.save();
    await txBlock2.save();

    article.contentBlocks = [txBlock._id, imgBlock._id, txBlock2._id];

    await article.save();

    //await article.populate("contentBlocks").execPopulate();
    //await reader1.populate("interactions.with").execPopulate();
    //console.log(inspect(reader1, { depth: null }));
  };

  afterEach(async () => {
    await Article.deleteMany({});
    await ContentBlock.deleteMany({});
    await User.deleteMany({});
  });

  after(() => {
    server.close();
  });

  describe("Post ContentBlock ~/", () => {
    let token_user;
    let body = undefined;
    const execute = () => {
      return chai
        .request(server)
        .post(`/api/contentBlocks/`)
        .set("x-auth-token", token_user)
        .send(body);
    };

    beforeEach(async () => {
      await genUsersDB(1, 2);
      await genArticleDB(authors_db[0]);
      token_user = authors_token[0];
      body = contGen.generateTextBlockReq(article._id.toHexString(), 1, true);
      //body = contGen.generateImageBlockReq(article._id.toHexString(), true);
    });

    it("should return 200 and save a text block with a valid request", async () => {
      const res = await execute();
      res.should.have.status(200);
    });
  });
});
