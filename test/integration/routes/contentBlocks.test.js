process.env.NODE_ENV = "test";

let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../../../index");
let should = chai.should();
chai.use(chaiHttp);

const _ = require("lodash");
const mongoose = require("mongoose");
const { User } = require("../../../models/user");
const { ContentBlock } = require("../../../models/contentBlock");

describe("/api/contentBlocks", () => {
  let author;
  let token;

  beforeEach(async () => {
    author = new User({
      firstName: "Name1",
      lastName: "Surname1",
      email: "dto_user1@dto.com",
      password: "1234!@#$QWERqwer",
      isAdmin: true
    });

    token = author.generateUserAuthToken();
    author.encryptPassword();
    await author.save();
  });

  afterEach(async () => {
    await User.deleteMany({});
    await server.close();
  });

  describe("POST /", () => {
    let param = "";
    let content;
    const execute = () => {
      return chai
        .request(server)
        .post("/api/contentBlocks/" + param)
        .set("x-auth-token", token)
        .send(content);
    };

    beforeEach(async () => {
      content = {
        author: author._id.toHexString(),
        isPremium: true,
        contentType: "Text"
      };
    });

    afterEach(async () => {
      await ContentBlock.deleteMany({});
    });

    it("should save and return text content blocks with valid request", async () => {
      //!!! req must include contentType!
      content.contentType = "Text";
      content.textContent =
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

      const res = await execute();
      res.should.have.status(200);
      res.body.should.have.property("author");
      res.body.author.lastName.should.be.eql(author.lastName);
      res.body.textContent.should.be.eql(content.textContent);
      should.not.exist(res.body.author.email);
      should.not.exist(res.body.password);
    });

    it("should save and return image content blocks with valid request", async () => {
      //!!! req must include contentType!
      content.contentType = "Image";
      content.imageURL =
        "https://drive.google.com/file/d/1jn2r4tSNU9sVSCmF4UIdEtBjTcrGCIll/view";

      const res = await execute();
      res.should.have.status(200);
      res.body.should.have.property("author");
      res.body.author.lastName.should.be.eql(author.lastName);
      res.body.imageURL.should.be.eql(content.imageURL);
      should.not.exist(res.body.author.email);
      should.not.exist(res.body.password);
    });

    it("should save and return video content blocks with valid request", async () => {
      //!!! req must include contentType!
      content.contentType = "Video";
      content.videoURL = "https://vimeo.com/178194135";

      const res = await execute();
      res.should.have.status(200);
      res.body.should.have.property("author");
      res.body.author.lastName.should.be.eql(author.lastName);
      res.body.videoURL.should.be.eql(content.videoURL);
      should.not.exist(res.body.author.email);
      should.not.exist(res.body.password);
    });

    it("should return 401 when the user is not logged in", async () => {
      token = "";
      const res = await execute();
      res.should.have.status(401);
    });

    it("should return 400 with invalid content type", async () => {
      content.contentType = "Whatever";
      const res = await execute();
      res.should.have.status(400);
    });

    it("should return 400 without content type", async () => {
      content = _.omit(content, ["contentType"]);
      const res = await execute();
      res.should.have.status(400);
    });

    it("should return 400 with invalid request, isPremium is not a boolean", async () => {
      content.contentType = "Video";
      content.videoURL = "https://vimeo.com/178194135";
      content.isPremium = "stupid";

      const res = await execute();
      res.should.have.status(400);
    });

    it("should return 400 with invalid request, not an url", async () => {
      content.contentType = "Video";
      content.videoURL = "htps//vimeo.com/178194135";

      const res = await execute();
      res.should.have.status(400);
    });
  });

  describe("GET /", () => {
    let param = "";
    const execute = () => {
      return chai
        .request(server)
        .get("/api/contentBlocks/" + param)
        .send();
    };

    //beforeEach(async () => {});

    //afterEach(async () => {});

    it("should return content blocks with valid author id", async () => {
      param = "author/" + author._id.toHexString();
      const res = await execute();
      res.should.have.status(200);
    });
  });
  //
});

// describe("/api/contentBlocks", () => {
//   let server;
//   let author;
//   let token;

//   beforeEach(async () => {
//     server = require("../../../index");

//     author = new User({
//       firstName: "Name1",
//       lastName: "Surname1",
//       email: "dto_user1@dto.com",
//       password: "1234!@#$QWERqwer",
//       isAdmin: true
//     });

//     token = author.generateUserAuthToken();
//     author.encryptPassword();
//     await author.save();
//   });

//   afterEach(async () => {
//     await User.deleteMany({});
//     await server.close();
//   });

//   describe("POST /", () => {
//     let param = "";
//     let content;
//     const execute = () => {
//       return request(server)
//         .post("/api/contentBlocks/" + param)
//         .set("x-auth-token", token)
//         .send(content);
//     };

//     beforeEach(async () => {});

//     afterEach(async () => {
//       ContentBlock.deleteMany({});
//     });

//     it("should save and return text content blocks with valid request", async () => {
//       //!!! req must include contentType!
//       content = {
//         author: author._id.toHexString(),
//         isPremium: true,
//         contentType: "Text",
//         textContent:
//           "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
//       };

//       const res = await execute();
//       expect(res.status).toBe(200);
//       expect(res.body.author.lastName).toMatch(author.lastName);
//       expect(res.body.textContent).toMatch(content.textContent);
//       expect(res.body.author.email).toBeUndefined();
//       expect(res.body.author.password).toBeUndefined();
//     });

//     it("should save and return image content blocks with valid request", async () => {
//       //!!! req must include contentType!
//       content = {
//         author: author._id.toHexString(),
//         isPremium: true,
//         contentType: "Image",
//         imageURL: ""
//       };

//       const res = await execute();
//       expect(res.status).toBe(200);
//       expect(res.body.author.lastName).toMatch(author.lastName);
//       expect(res.body.imageURL).toMatch(content.imageURL);
//       expect(res.body.author.email).toBeUndefined();
//       expect(res.body.author.password).toBeUndefined();
//     });

//     it("should save and return video content blocks with valid request", async () => {
//       //!!! req must include contentType!
//       content = {
//         author: author._id.toHexString(),
//         isPremium: true,
//         contentType: "Video",
//         videoURL: ""
//       };

//       const res = await execute();
//       expect(res.status).toBe(200);
//       expect(res.body.author.lastName).toMatch(author.lastName);
//       expect(res.body.videoURL).toMatch(content.videoURL);
//       expect(res.body.author.email).toBeUndefined();
//       expect(res.body.author.password).toBeUndefined();
//     });

//     it("should return 401 when is not logged in", async () => {
//       token = "";
//       const res = await execute();
//       expect(res.status).toBe(401);
//     });
//   });

//   describe("GET /", () => {
//     let param = "";
//     const execute = () => {
//       return request(server)
//         .get("/api/contentBlocks/" + param)
//         .send();
//     };

//     //beforeEach(async () => {});

//     //afterEach(async () => {});

//     it("should return content blocks with valid author id", async () => {
//       param = "author/" + author._id;
//       const res = await execute();
//       expect(res.status).toBe(200);
//     });
//   });
// });
