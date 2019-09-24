process.env.NODE_ENV = "test";

const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../../../index");
const should = chai.should();
chai.use(chaiHttp);

const _ = require("lodash");
const mongoose = require("mongoose");
const { User } = require("../../../models/user");
const ContentPlaceholderGenerator = require("../../../utils/contentGenerator");
const { Article } = require("../../../models/article");
const { ContentBlock } = require("../../../models/contentBlock");
const { TextBlock } = require("../../../models/textBlock");

describe("/api/articles", () => {
  const contentGen = new ContentPlaceholderGenerator();
  let author1;
  let author2;
  let reader;
  let token_author1;
  let token_author2;
  let token_reader;
  let article;

  beforeEach(async () => {
    author1 = new User(contentGen.generateAuthor("1", true));
    author2 = new User(contentGen.generateAuthor("2", false));
    reader = new User(contentGen.generateAuthor("3", false));

    author1.encryptPassword();
    author2.encryptPassword();
    reader.encryptPassword();

    token_author1 = author1.generateUserAuthToken();
    token_author2 = author2.generateUserAuthToken();
    token_reader = reader.generateUserAuthToken();
    await User.insertMany([author1, author2, reader]);
  });

  afterEach(async () => {
    await User.deleteMany({});
    await Article.deleteMany({});
    server.close();
  });

  describe("POST / Article Basic", () => {
    let param = "";
    let token_user;
    const execute = () => {
      return chai
        .request(server)
        .post("/api/articles/" + param)
        .set("x-auth-token", token_user)
        .send(article);
    };

    beforeEach(() => {
      article = contentGen.generateArticlePlaceholder(
        author1._id.toHexString()
      );
      token_user = token_author1;
    });

    afterEach(async () => {
      await Article.deleteMany({});
    });

    it("should return 200 and create an empty article when user started writing", async () => {
      const res = await execute();
      res.should.have.status(200);
      res.body.should.have.property("author");
      res.body.author.lastName.should.be.eql(author1.lastName);
      res.body.contentBlocks.should.be.eql([]);
      should.not.exist(res.body.author.email);
      should.not.exist(res.body.author.password);
    });

    it("should return 400 with invalid request", async () => {
      article.status = "Whatever";
      const res = await execute();
      res.should.have.status(400);
    });

    it("should return 400 with invalid request", async () => {
      article.metadata = {
        usefulCount: 1000
      };
      const res = await execute();
      res.should.have.status(400);
    });

    it("should return 401 if user is not logged in", async () => {
      token_user = "";
      const res = await execute();
      res.should.have.status(401);
    });
  });

  describe("PUT / Article Basic", () => {
    let article_db;
    let token_user;
    let param = "";
    const execute = () => {
      return chai
        .request(server)
        .put("/api/articles/" + param)
        .set("x-auth-token", token_user)
        .send(article);
    };

    beforeEach(async () => {
      article = contentGen.generateArticlePlaceholder(
        author1._id.toHexString()
      );
      article_db = new Article(article);
      await article_db.save();
      param = article_db._id;
      token_user = token_author1;

      article.title = "This is a great article";
      article.subTitle = "let's make AEC industry better togeter!";
      article.status = "Pending";
    });

    afterEach(async () => {
      await Article.deleteMany({});
    });

    it("should return 200 and update article's basic data with valid request", async () => {
      const res = await execute();
      res.should.have.status(200);
      res.body.title.should.be.eql(article.title);
      res.body.subTitle.should.be.eql(article.subTitle);
      res.body.status.should.be.eql(article.status);
      should.not.exist(res.body.author.email);
      should.not.exist(res.body.author.password);
    });

    it("should return 400 with invalid article id", async () => {
      param = "131241231";
      const res = await execute();
      res.should.have.status(400);
    });

    it("should return 401 if user is not logged in", async () => {
      token_user = "";
      const res = await execute();
      res.should.have.status(401);
    });

    it("should return 403 if the user is not the author", async () => {
      token_user = token_author2;

      const res = await execute();
      res.should.have.status(403);
    });

    it("should return 404 if no article was found with an valid id", async () => {
      param = mongoose.Types.ObjectId().toHexString();
      const res = await execute();
      res.should.have.status(404);
    });
  });

  describe("PUT / Article Opinions", () => {
    let article_db;
    let param = "";
    let opinionType;
    let token_user;
    const execute = () => {
      return chai
        .request(server)
        .put(`/api/articles/${param}/opinions`)
        .set("x-auth-token", token_user)
        .send({
          opinion: opinionType
        });
    };

    beforeEach(async () => {
      token_user = token_reader;
      article = contentGen.generateArticlePlaceholder(
        author1._id.toHexString()
      );
      article.title = "This is a great article";
      article.subTitle = "let's make AEC industry better togeter!";
      article.status = "Published";
      article.opinions = [
        {
          user: author2._id,
          opinion: "NotUseful"
        }
      ];
      article_db = new Article(article);
      article_db.metadata.notUsefulCount = 1;
      await article_db.save();

      param = article_db._id;
      opinionType = "Useful";
      //different user
    });

    afterEach(async () => {
      await Article.deleteMany({});
    });

    it("should return 200 and add a new opinion", async () => {
      const res = await execute();
      res.should.have.status(200);
      res.body.metadata.notUsefulCount.should.be.eql(1);
      res.body.metadata.usefulCount.should.be.eql(1);
      should.not.exist(res.body.opinions);
    });

    it("should return 200 and update opinion", async () => {
      token_user = token_author2;
      const res = await execute();
      res.should.have.status(200);
      res.body.metadata.notUsefulCount.should.be.eql(0);
      res.body.metadata.usefulCount.should.be.eql(1);
      should.not.exist(res.body.opinions);
    });

    it("should return 400 with invalid article id", async () => {
      param = "131241231";
      const res = await execute();
      res.should.have.status(400);
    });

    it("should return 400 if the article is not in published status", async () => {
      article_db.status = "Pending";
      await article_db.save();
      const res = await execute();
      res.should.have.status(400);
    });

    it("should return 400 with invalid opinion req", async () => {
      opinionType = "Whatever";
      const res = await execute();
      res.should.have.status(400);
    });

    it("should return 400 if the user has already opined in a same way", async () => {
      token_user = token_author2;
      opinionType = "NotUseful";
      const res = await execute();
      res.should.have.status(400);
    });

    it("should return 401 if user is not logged in", async () => {
      token_user = "";
      const res = await execute();
      res.should.have.status(401);
    });

    it("should return 403 if the opinion was sent by the author", async () => {
      token_user = token_author1;
      const res = await execute();
      res.should.have.status(403);
    });

    it("should return 404 if no article was found with an valid id", async () => {
      param = mongoose.Types.ObjectId().toHexString();
      const res = await execute();
      res.should.have.status(404);
    });
  });

  //Check contents and opinions as well
  describe("GET / Article, Opinions, and Contents", () => {
    let param = "";
    let token_user;
    let article_db1;
    let article_db2;
    const execute = () => {
      return chai
        .request(server)
        .get("/api/articles/" + param)
        .set("x-auth-token", token_user)
        .send();
    };

    //Contents!!!
    const genArticles = (identifier, author, reader) => {
      return new Article({
        author: author._id.toHexString(),
        title: `This is a great article ${identifier}`,
        subTitle: "let's make AEC industry better togeter!",
        status: "Published",
        opinions: [
          {
            user: reader._id,
            opinion: "NotUseful"
          }
        ],
        metadata: {
          notUsefulCount: 1
        }
      });
    };

    beforeEach(async () => {
      token_user = "";
      article_db1 = await genArticles("1", author1, reader).save();
      article_db2 = await genArticles("2", author2, reader).save();
    });

    afterEach(async () => {
      await Article.deleteMany({});
    });

    it("should return 200 and the article by valid id without any token", async () => {
      param = article_db1._id.toHexString();
      const res = await execute();
      res.should.have.status(200);
      res.body.title.should.be.eql(article_db1.title);
      res.body.author.should.be.eql(article_db1.author._id.toHexString());
      res.body.metadata.notUsefulCount.should.be.eql(1);
    });
  });
});
