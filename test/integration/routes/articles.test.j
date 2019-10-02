process.env.NODE_ENV = "test";
//const { inspect } = require("util");
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
const { Article } = require("../../../models/article");

describe("CRUD Ops Articles/ ~api/articles/", () => {
  const contGen = new ContentGenerator();
  let authors_db = [];
  let authors_token = [];
  let readers_db = [];
  let readers_token = [];
  let articles_db = [];

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

  const genArticleDB = async (as, int_count) => {
    articles_db = [];
    for (let i = 0; i < as.length; ++i) {
      const article_db_id = mongoose.Types.ObjectId().toHexString();
      let article_req = contGen.generateArticleBase(as[i]._id.toHexString());
      article_req._id = article_db_id;
      article_req.status = "Published";

      let a = new Article(article_req);
      for (let j = 0; j < int_count; ++j) {
        a.interactedBy(readers_db[j], "ContentView");
        await readers_db[j].save();
      }
      await a.save();
      articles_db.push(a);
    }
    //await Article.insertMany(articles_db);
    //console.log(inspect(article_db, { depth: null }));
  };

  afterEach(async () => {
    await Article.deleteMany({});
    await User.deleteMany({});
  });

  after(() => {
    server.close();
  });

  describe("Post Article ~/my/", () => {
    let token_user;
    let body = undefined;
    const execute = () => {
      return chai
        .request(server)
        .post(`/api/articles/my`)
        .set("x-auth-token", token_user)
        .send(body);
    };

    beforeEach(async () => {
      await genUsersDB(1, 0);
      token_user = authors_token[0];
      body = contGen.generateArticleBase(authors_db[0]._id);
      delete body.author;
    });

    it("should return 200 and save an article with a valid request", async () => {
      const res = await execute();
      res.should.have.status(200);
      res.body.author.should.be.eql(authors_db[0]._id.toHexString());
      res.body.metadata.viewCount.should.be.eql(0);
      res.body.metadata.anoViewCount.should.be.eql(0);
      should.not.exist(res.body.interactions);
      should.not.exist(res.body.opinions);
    });

    it("should return 400 with invalid token", async () => {
      token_user = "asdfas32gsdx";
      const res = await execute();
      res.should.have.status(400);
    });

    it("should return 400 with invalid request 1", async () => {
      body = {
        test: "whatever"
      };
      const res = await execute();
      res.should.have.status(400);
    });

    it("should return 400 with invalid request 2", async () => {
      body = {
        author: mongoose.Types.ObjectId().toHexString(),
        status: "Published"
      };
      const res = await execute();
      res.should.have.status(400);
    });

    it("should return 400 with invalid request 3", async () => {
      body.metadata = {
        viewCount: 1000
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

  describe("Put Article/ ~/my/id/", () => {
    let param = "";
    let token_user;
    let body = undefined;
    const execute = () => {
      return chai
        .request(server)
        .put(`/api/articles/my/${param}`)
        .set("x-auth-token", token_user)
        .send(body);
    };

    beforeEach(async () => {
      await genUsersDB(1, 2);
      await genArticleDB([authors_db[0]], 0);
      param = articles_db[0]._id.toHexString();
      token_user = authors_token[0];
      body = {
        title: "A New Title",
        subTitle: "A New Subtitle! Yes",
        status: "Published"
      };
    });

    it("should return 200 and update the article's content", async () => {
      const res = await execute();
      res.should.have.status(200);
      res.body.title.should.be.eql(body.title);
      res.body.metadata.viewCount.should.be.eql(0);
      should.not.exist(res.body.interactions);
      should.not.exist(res.body.opinions);
    });

    it("should return 200 and update the article's status", async () => {
      body = {
        status: "Pending"
      };
      const res = await execute();
      res.should.have.status(200);
      res.body.status.should.be.eql("Pending");
      res.body.metadata.viewCount.should.be.eql(0);
      should.not.exist(res.body.interactions);
      should.not.exist(res.body.opinions);
    });

    it("should return 400 with invalid token", async () => {
      token_user = "asdfas32gsdx";
      const res = await execute();
      res.should.have.status(400);
    });

    it("should return 400 with invalid request 1", async () => {
      body = {
        title: "A New Title",
        subTitle: "A New Subtitle! Yes"
      };
      const res = await execute();
      res.should.have.status(400);
    });

    it("should return 400 with invalid request 2", async () => {
      body.metadata = {
        viewCount: 1000
      };
      const res = await execute();
      res.should.have.status(400);
    });

    it("should return 400 with invalid request 3", async () => {
      body.author = readers_db[0]._id.toHexString();
      const res = await execute();
      res.should.have.status(400);
    });

    it("should return 401 if user is not logged in", async () => {
      token_user = "";
      const res = await execute();
      res.should.have.status(401);
    });

    it("should return 404 if no article found", async () => {
      param = mongoose.Types.ObjectId().toHexString();
      const res = await execute();
      res.should.have.status(404);
    });
  });

  describe("Put Opine an Article/ ~/id/opine", () => {
    let param = "";
    let token_user;
    let body = undefined;
    let prevUsefulCount, prevNotUsefulCount;
    const execute = () => {
      return chai
        .request(server)
        .put(`/api/articles/${param}/opine`)
        .set("x-auth-token", token_user)
        .send(body);
    };

    beforeEach(async () => {
      await genUsersDB(2, 2);
      await genArticleDB([authors_db[0], authors_db[0], authors_db[1]], 2);

      articles_db[0].opinions.push({
        by: readers_db[1]._id,
        opinion: "NotUseful",
        comment: "Not so useful..."
      });
      articles_db[0].metadata.notUsefulCount++;
      await articles_db[0].save();

      param = articles_db[0]._id.toHexString();
      prevUsefulCount = articles_db[0].metadata.usefulCount;
      prevNotUsefulCount = articles_db[0].metadata.notUsefulCount;
      token_user = readers_token[0];
      body = {
        opinion: "Useful",
        comment: "This is very helpful!"
      };
    });

    it("should return 200 and opine the article 1", async () => {
      const res = await execute();
      expect(res).status(200);
      expect(res.body.metadata).to.have.property("usefulCount", 1);
      expect(res.body.metadata).to.have.property("notUsefulCount", 1);
    });

    it("should return 200 and opine the article 2", async () => {
      body.opinion = "NotUseful";
      const res = await execute();
      expect(res).status(200);
      expect(res.body.metadata).to.have.property("usefulCount", 0);
      expect(res.body.metadata).to.have.property("notUsefulCount", 2);
    });

    it("should return 200 and no opine the article with withdraw", async () => {
      body.opinion = "Withdraw";
      const res = await execute();
      expect(res).status(200);
      expect(res.body.metadata).to.have.property("usefulCount", 0);
      expect(res.body.metadata).to.have.property("notUsefulCount", 1);
    });

    it("should return 200 and remove opine the article with withdraw", async () => {
      token_user = readers_token[1];
      body.opinion = "Withdraw";
      const res = await execute();
      expect(res).status(200);
      expect(res.body.metadata).to.have.property("usefulCount", 0);
      expect(res.body.metadata).to.have.property("notUsefulCount", 0);
    });

    it("should return 400 if the same user tries to opine in the same way", async () => {
      token_user = readers_token[1];
      body.opinion = "NotUseful";
      const res = await execute();
      expect(res).status(400);
    });

    it("should return 400 with an invalid request", async () => {
      body.opinion = "Like";
      const res = await execute();
      expect(res).status(400);
    });

    it("should return 400 with an invalid request", async () => {
      body.by = mongoose.Types.ObjectId().toHexString();
      const res = await execute();
      expect(res).status(400);
    });

    it("should return 400 with an invalid request", async () => {
      body.metadata = {
        usefulCount: 100
      };
      const res = await execute();
      expect(res).status(400);
    });

    it("should return 400 with an invalid article id", async () => {
      param = "1234123412";
      const res = await execute();
      expect(res).status(400);
    });

    it("should return 400 with an invalid token", async () => {
      token_user = "1234123asef";
      const res = await execute();
      expect(res).status(400);
    });

    it("should return 401 if user is not logged in", async () => {
      token_user = "";
      const res = await execute();
      expect(res).status(401);
    });

    it("should return 403 if the author tries to opine own article", async () => {
      token_user = authors_token[0];
      const res = await execute();
      expect(res).status(403);
    });

    it("should return 404 if no article found", async () => {
      param = mongoose.Types.ObjectId().toHexString();
      const res = await execute();
      res.should.have.status(404);
    });
  });

  describe("Get My Articles/ ~/my/?page&limit", () => {
    let token_user;
    let body = undefined;
    let query;
    const execute = () => {
      return chai
        .request(server)
        .get(`/api/articles/my/${query}`)
        .set("x-auth-token", token_user)
        .send(body);
    };
    beforeEach(async () => {
      await genUsersDB(3, 1);
      await genArticleDB(
        [
          authors_db[0],
          authors_db[0],
          authors_db[0],
          authors_db[0],
          authors_db[0],
          authors_db[0],
          authors_db[0],
          authors_db[1],
          authors_db[1],
          authors_db[1],
          authors_db[1]
        ],
        1
      );
      token_user = authors_token[0];
      body = undefined;
      query = "?page=0&limit=5";
    });

    it("should return 200 and get my articles 1", async () => {
      const res = await execute();
      expect(res).status(200);
      expect(res.body.length).to.be.eql(5);
      const author_idStr = authors_db[0]._id.toHexString();
      expect(res.body)
        .to.be.an("array")
        .that.contains.something.like({ author: author_idStr });
    });

    it("should return 200 and get my articles 2", async () => {
      query = "?page=1&limit=5";
      const res = await execute();
      expect(res).status(200);
      expect(res.body.length).to.be.eql(2);
      const author_idStr = authors_db[0]._id.toHexString();
      expect(res.body)
        .to.be.an("array")
        .that.contains.something.like({ author: author_idStr });
    });

    it("should return 200 and get my articles 3", async () => {
      token_user = authors_token[1];
      const res = await execute();
      expect(res).status(200);
      expect(res.body.length).to.be.eql(4);
      const author_idStr = authors_db[1]._id.toHexString();
      expect(res.body)
        .to.be.an("array")
        .that.contains.something.like({ author: author_idStr });
    });

    it("should return 200 and get my articles 4", async () => {
      query = "";
      const res = await execute();
      expect(res).status(200);
      expect(res.body.length).to.be.eql(5);
      const author_idStr = authors_db[0]._id.toHexString();
      expect(res.body)
        .to.be.an("array")
        .that.contains.something.like({ author: author_idStr });
    });

    it("should return 200 and get my articles 5", async () => {
      query = "?page=1";
      const res = await execute();
      expect(res).status(200);
      expect(res.body.length).to.be.eql(2);
      const author_idStr = authors_db[0]._id.toHexString();
      expect(res.body)
        .to.be.an("array")
        .that.contains.something.like({ author: author_idStr });
    });

    it("should return 200 and get empty array if no article found", async () => {
      token_user = authors_token[2];
      const res = await execute();
      expect(res).status(200);
      expect(res.body.length).to.be.eql(0);
    });

    it("should return 400 with invalid token", async () => {
      token_user = "asdfas32gsdx";
      const res = await execute();
      res.should.have.status(400);
    });

    it("should return 400 with invalid page query string", async () => {
      query = "?page=a";
      const res = await execute();
      res.should.have.status(400);
    });

    it("should return 400 with invalid limit query string", async () => {
      query = "?limit=a";
      const res = await execute();
      res.should.have.status(400);
    });

    it("should return 400 with invalid page query string", async () => {
      query = "?page=-1";
      const res = await execute();
      res.should.have.status(400);
    });

    it("should return 400 with invalid limit query string", async () => {
      query = "?limit=-1";
      const res = await execute();
      res.should.have.status(400);
    });

    it("should return 401 if user is not logged in", async () => {
      token_user = "";
      const res = await execute();
      res.should.have.status(401);
    });

    it("should return 403 with a body in the request", async () => {
      body = { me: "asdf" };
      const res = await execute();
      res.should.have.status(403);
    });
  });

  describe("Get Others Articles For Preview/ ~/author/id/", () => {
    let param = "";
    let query;
    let token_user;
    let body = undefined;
    const execute = () => {
      return chai
        .request(server)
        .get(`/api/articles/author/${param}/${query}`)
        .set("x-auth-token", token_user)
        .send(body);
    };
    beforeEach(async () => {
      await genUsersDB(3, 1);
      await genArticleDB(
        [
          authors_db[0],
          authors_db[0],
          authors_db[0],
          authors_db[0],
          authors_db[0],
          authors_db[0],
          authors_db[0],
          authors_db[1],
          authors_db[1],
          authors_db[1],
          authors_db[1]
        ],
        1
      );
      token_user = readers_token[0];
      param = authors_db[0]._id.toHexString();
      query = "?page=0&limit=5";
      body = undefined;
    });

    it("should return 200 and get others articles 1", async () => {
      const res = await execute();
      expect(res).status(200);
      expect(res.body.length).to.be.eql(5);
      expect(res.body).to.not.have.property("contentBlocks");
      const author_idStr = authors_db[0]._id.toHexString();
      expect(res.body)
        .to.be.an("array")
        .that.contains.something.like({ author: author_idStr });
    });

    it("should return 200 and get others articles 2", async () => {
      query = "?page=1";
      const res = await execute();
      expect(res).status(200);
      expect(res.body.length).to.be.eql(2);
      expect(res.body).to.not.have.property("contentBlocks");
      const author_idStr = authors_db[0]._id.toHexString();
      expect(res.body)
        .to.be.an("array")
        .that.contains.something.like({ author: author_idStr });
    });

    it("should return 200 and get others articles 2", async () => {
      query = "?page=1";
      const res = await execute();
      expect(res).status(200);
      expect(res.body.length).to.be.eql(2);
      expect(res.body).to.not.have.property("contentBlocks");
      const author_idStr = authors_db[0]._id.toHexString();
      expect(res.body)
        .to.be.an("array")
        .that.contains.something.like({ author: author_idStr });
    });

    it("should return 200 and get others articles 3", async () => {
      query = "?page=1";
      articles_db[5].status = "Pending";
      await articles_db[5].save();
      const res = await execute();
      expect(res).status(200);
      expect(res.body.length).to.be.eql(1);
      expect(res.body).to.not.have.property("contentBlocks");
      const author_idStr = authors_db[0]._id.toHexString();
      expect(res.body)
        .to.be.an("array")
        .that.contains.something.like({ author: author_idStr });
    });

    it("should return 200 and get others articles w/o log in 1", async () => {
      token_user = "";
      query = "?page=1";
      const res = await execute();
      expect(res).status(200);
      expect(res.body.length).to.be.eql(2);
      expect(res.body).to.not.have.property("contentBlocks");
      const author_idStr = authors_db[0]._id.toHexString();
      expect(res.body)
        .to.be.an("array")
        .that.contains.something.like({ author: author_idStr });
    });

    it("should return 200 and get empty array if no article found", async () => {
      param = authors_db[2]._id.toHexString();
      const res = await execute();
      expect(res).status(200);
      expect(res.body.length).to.be.eql(0);
    });

    it("should return 400 with invalid id", async () => {
      param = "1f9fs39f";
      const res = await execute();
      res.should.have.status(400);
    });

    it("should return 400 with invalid page query string", async () => {
      query = "?page=a";
      const res = await execute();
      res.should.have.status(400);
    });

    it("should return 400 with invalid limit query string", async () => {
      query = "?limit=a";
      const res = await execute();
      res.should.have.status(400);
    });

    it("should return 400 with invalid page query string", async () => {
      query = "?page=-1";
      const res = await execute();
      res.should.have.status(400);
    });

    it("should return 400 with invalid limit query string", async () => {
      query = "?limit=-1";
      const res = await execute();
      res.should.have.status(400);
    });

    it("should return 403 with a body in the request", async () => {
      body = { me: "asdf" };
      const res = await execute();
      res.should.have.status(403);
    });
  });

  describe("Get An Article For View/ ~/id/view/", () => {
    let param = "";
    let token_user;
    let prevArticleAnoViewCount;
    let prevArticleViewCount;
    let prevUserContentViewCount;
    let body = undefined;
    const execute = () => {
      return chai
        .request(server)
        .get(`/api/articles/${param}/view`)
        .set("x-auth-token", token_user)
        .send(body);
    };

    beforeEach(async () => {
      await genUsersDB(1, 5);
      await genArticleDB([authors_db[0]], 5);
      param = articles_db[0]._id;
      token_user = readers_token[0];
      body = undefined;

      prevArticleAnoViewCount = articles_db[0].metadata.anoViewCount;
      prevArticleViewCount = articles_db[0].metadata.viewCount;
      prevUserContentViewCount = readers_db[0].metadata.contentViewCount;
    });

    it("should return 200 and update the article's viewCount and the reader's contentViewCount", async () => {
      const res = await execute();
      const reader = await User.findById(readers_db[0]._id);
      res.should.have.status(200);
      res.body.metadata.viewCount.should.be.eql(prevArticleViewCount + 1);
      reader.metadata.contentViewCount.should.be.eql(
        prevUserContentViewCount + 1
      );
      res.body.metadata.anoViewCount.should.be.eql(prevArticleAnoViewCount);
      should.not.exist(res.body.interactions);
      should.not.exist(res.body.opinions);
    });

    it("should return 200 and update the article's anoViewCount when a reader is not logged in", async () => {
      token_user = "";
      const res = await execute();
      res.should.have.status(200);
      res.body.metadata.viewCount.should.be.eql(prevArticleViewCount);
      res.body.metadata.anoViewCount.should.be.eql(prevArticleAnoViewCount + 1);
      should.not.exist(res.body.interactions);
      should.not.exist(res.body.opinions);
    });

    it("should return 200 and do not update the article if the reader is the author", async () => {
      token_user = authors_token[0];
      const prevAuthViewCount = authors_db[0].metadata.contentViewCount;
      const res = await execute();
      const reader = await User.findById(authors_db[0]._id);

      res.should.have.status(200);
      res.body.metadata.viewCount.should.be.eql(prevArticleViewCount);
      res.body.metadata.anoViewCount.should.be.eql(prevArticleAnoViewCount);
      reader.metadata.contentViewCount.should.be.eql(prevAuthViewCount);
      should.not.exist(res.body.interactions);
      should.not.exist(res.body.opinions);
    });

    it("should return 400 with invalid token", async () => {
      token_user = "asdfas32gsdx";
      const res = await execute();
      res.should.have.status(400);
    });

    it("should return 400 with invalid id", async () => {
      param = "1f9fs39f";
      const res = await execute();
      res.should.have.status(400);
    });

    it("should return 403 with a body in the request", async () => {
      body = { a: "asdf" };
      const res = await execute();
      res.should.have.status(403);
    });

    it("should return 404 if the article is not published", async () => {
      articles_db[0].status = "Editing";
      await articles_db[0].save();
      const res = await execute();
      res.should.have.status(404);
    });

    it("should return 404 if no article found", async () => {
      param = mongoose.Types.ObjectId().toHexString();
      const res = await execute();
      res.should.have.status(404);
    });
  });

  describe("Delete My Article/ ~/my/id", () => {
    let param = "";
    let token_user;
    let body = undefined;
    const execute = () => {
      return chai
        .request(server)
        .delete(`/api/articles/my/${param}`)
        .set("x-auth-token", token_user)
        .send(body);
    };
    beforeEach(async () => {
      await genUsersDB(3, 1);
      await genArticleDB(
        [
          authors_db[0],
          authors_db[0],
          authors_db[0],
          authors_db[1],
          authors_db[1]
        ],
        1
      );
      token_user = authors_token[0];
      param = articles_db[0]._id.toHexString();
      body = undefined;
    });

    it("should return 200 and delete an article with a valid id", async () => {
      const res = await execute();
      res.should.have.status(200);

      const articles = await Article.find({
        author: authors_db[0]._id
      });
      expect(articles.length).to.be.eql(2);
    });

    it("should return 400 with invalid token", async () => {
      token_user = "asdfas32gsdx";
      const res = await execute();
      res.should.have.status(400);

      const articles = await Article.countDocuments();
      expect(articles).to.be.eql(5);
    });

    it("should return 400 with invalid id", async () => {
      param = "1f9fs39f";
      const res = await execute();
      res.should.have.status(400);

      const articles = await Article.countDocuments();
      expect(articles).to.be.eql(5);
    });

    it("should return 403 with a body in the request", async () => {
      body = { a: "asdf" };
      const res = await execute();
      res.should.have.status(403);

      const articles = await Article.countDocuments();
      expect(articles).to.be.eql(5);
    });

    it("should return 403 if user is not the author", async () => {
      token_user = authors_token[1];
      const res = await execute();
      res.should.have.status(403);

      const articles = await Article.countDocuments();
      expect(articles).to.be.eql(5);
    });

    it("should return 404 if no article found", async () => {
      param = mongoose.Types.ObjectId().toHexString();
      const res = await execute();
      res.should.have.status(404);

      const articles = await Article.countDocuments();
      expect(articles).to.be.eql(5);
    });
  });
});
