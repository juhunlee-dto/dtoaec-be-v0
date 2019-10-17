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
      body = contGen.generateTextBlockReq(article._id.toHexString(), 1, false);
    });

    it("should return 200 and save a text block with a valid request 1", async () => {
      const res = await execute();
      expect(res).to.have.status(200);
      expect(res.body).to.have.property("textContent", body.textContent);
      expect(res.body).to.have.property("isPremium", false);
      const a = await Article.findById(article._id);
      expect(a).to.have.property("contentBlocks");
      const cbs = a.contentBlocks;
      expect(cbs).to.have.lengthOf(1);
      const txb = await ContentBlock.findById(cbs[0]);
      expect(txb).to.have.property("textContent", body.textContent);
      expect(txb).to.have.property("isPremium", false);
    });

    it("should return 200 and save an image block with a valid request 1", async () => {
      body = contGen.generateImageBlockReq(article._id.toHexString(), true);
      const res = await execute();
      expect(res).to.have.status(200);
      expect(res.body).to.have.property("imageURL", body.imageURL);
      expect(res.body).to.have.property("isPremium", true);
      const a = await Article.findById(article._id);
      expect(a).to.have.property("contentBlocks");
      const cbs = a.contentBlocks;
      expect(cbs).to.have.lengthOf(1);
      const txb = await ContentBlock.findById(cbs[0]);
      expect(txb).to.have.property("imageURL", body.imageURL);
      expect(txb).to.have.property("isPremium", true);
    });

    it("should return 200 and save a text block with a valid request 2", async () => {
      await appendContentBlocksDB(authors_db[0], readers_db[0], readers_db[1]);
      const res = await execute();
      expect(res).to.have.status(200);
      expect(res.body).to.have.property("textContent", body.textContent);
      expect(res.body).to.have.property("isPremium", false);
      const a = await Article.findById(article._id);
      expect(a).to.have.property("contentBlocks");
      const cbs = a.contentBlocks;
      expect(cbs).to.have.lengthOf(4);
      const txb = await ContentBlock.findById(cbs[cbs.length - 1]);
      expect(txb).to.have.property("textContent", body.textContent);
      expect(txb).to.have.property("isPremium", false);
    });

    it("should return 400 with an invalid request 1", async () => {
      body = null;
      const res = await execute();
      expect(res).to.have.status(400);
    });

    it("should return 400 with an invalid request 2", async () => {
      delete body.parent;
      const res = await execute();
      expect(res).to.have.status(400);
    });

    it("should return 400 with an invalid request 3", async () => {
      body.like = 100;
      const res = await execute();
      expect(res).to.have.status(400);
    });

    it("should return 400 with an invalid request 4", async () => {
      body.metadata = {
        usefulCount: 1000,
        viewCount: 1000
      };
      const res = await execute();
      expect(res).to.have.status(400);
    });

    it("should return 400 with an invalid request 5", async () => {
      body.opinions = [
        {
          by: authors_db[0]._id.toHexString(),
          opinion: "Useful",
          comment: "Great"
        }
      ];
      const res = await execute();
      expect(res).to.have.status(400);
    });

    it("should return 400 with invalid token", async () => {
      token_user = "asdfas32gsdx";
      const res = await execute();
      expect(res).to.have.status(400);
    });

    it("should return 401 if user is not logged in", async () => {
      token_user = "";
      const res = await execute();
      res.should.have.status(401);
    });

    it("should return 403 if user is not the author", async () => {
      token_user = readers_token[0];
      const res = await execute();
      res.should.have.status(403);
    });

    it("should return 404 if no content found", async () => {
      body.parent = mongoose.Types.ObjectId().toHexString();
      const res = await execute();
      expect(res).to.have.status(404);
    });
  });

  describe("Put ContentBlock ~/id", () => {
    let token_user;
    let param;
    let body = undefined;
    const execute = () => {
      return chai
        .request(server)
        .put(`/api/contentBlocks/${param}`)
        .set("x-auth-token", token_user)
        .send(body);
    };

    beforeEach(async () => {
      await genUsersDB(1, 2);
      await genArticleDB(authors_db[0]);
      token_user = authors_token[0];
      await appendContentBlocksDB(authors_db[0], readers_db[0], readers_db[1]);
      param = article.contentBlocks[0].toHexString();
      body = {
        parent: article._id.toHexString(),
        isPremium: true,
        contentType: "TextBlock",
        textContent: "New text content here!"
      };
    });

    it("should return 200 and update content block 1", async () => {
      const res = await execute();
      expect(res).to.have.status(200);
      expect(res.body).to.have.property("isPremium", body.isPremium);
      expect(res.body).to.have.property("textContent", body.textContent);
      //changing premium...what to update????
      //
    });
  });
});
