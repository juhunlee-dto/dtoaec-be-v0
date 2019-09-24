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

const genArticleDB = (appendix, author, reader1, reader2) => {
  return new Article({
    author: author._id,
    title: `This is a great ${appendix} article`,
    subTitle: "let's make AEC industry better togeter!",
    status: "Published",
    opinions: [
      {
        user: reader1._id,
        opinion: "NotUseful"
      },
      {
        user: reader2._id,
        opinion: "Useful"
      }
    ],
    contentBlocks: [],
    metadata: {
      viewCount: 10,
      usefulCount: 1,
      notUsefulCount: 1
    }
  });
};

// const genTextContentBlockDB = (isPremium, article, reader1) =>{
//   return new TextBlock({
//     isPremium:isPremium,
//     parent:article._id
//   })
// }

describe("/api/contentBlocks", () => {
  const contentGen = new ContentPlaceholderGenerator();
  let author;
  let reader1;
  let reader2;
  let token_author;
  let token_reader1;
  let token_reader2;
  let article;

  beforeEach(async () => {
    author = new User(contentGen.generateAuthor("1", true));
    reader1 = new User(contentGen.generateAuthor("2", false));
    reader2 = new User(contentGen.generateAuthor("3", false));

    author.encryptPassword();
    reader1.encryptPassword();
    reader2.encryptPassword();

    token_author = author.generateUserAuthToken();
    token_reader1 = reader1.generateUserAuthToken();
    token_reader2 = reader2.generateUserAuthToken();
    await User.insertMany([author, reader1, reader2]);

    article = genArticleDB("Test", author, reader1, reader2);
    await article.save();
  });

  afterEach(async () => {
    await User.deleteMany({});
    await Article.deleteMany({});
    server.close();
  });

  describe("POST / ContentBlock", () => {
    let param = "";
    let token_user;
    let content;
    const execute = () => {
      return chai
        .request(server)
        .post("/api/contentBlocks/" + param)
        .set("x-auth-token", token_user)
        .send(content);
    };

    beforeEach(() => {
      token_user = token_author;
    });

    afterEach(async () => {
      await Article.deleteMany({});
    });

    it("should return 200 and create a text content block", async () => {
      const res = await execute();
      res.should.have.status(200);
    });
  });
});
