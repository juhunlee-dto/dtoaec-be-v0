process.env.NODE_ENV = "test";
//const { inspect } = require("util");
const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../../../index");
const expect = chai.expect;
chai.use(chaiHttp);

const ContentGenerator = require("../../../utils/contentGenerator");
const mongoose = require("mongoose");
const { User } = require("../../../models/user");

describe("CRUD Ops Users/ ~api/users/", () => {
  const contGen = new ContentGenerator();
  let users_db = [];
  let users_token = [];

  const genUsersDB = async u_count => {
    users_db = [];
    users_token = [];
    for (let i = 0; i < u_count; ++i) {
      const u = contGen.generateUserModel(`user${i}`, false);
      if (i === 0) u.isAdmin = true;
      await u.encryptPassword();
      users_token.push(u.generateUserAuthToken());
      users_db.push(u);
    }
    await User.insertMany(users_db);
  };

  afterEach(async () => {
    await User.deleteMany({});
  });

  after(() => {
    server.close();
  });

  describe("Post User ~/id", () => {
    let newUser;
    const execute = () => {
      return chai
        .request(server)
        .post(`/api/users`)
        .send(newUser);
    };

    beforeEach(async () => {
      newUser = contGen.generateUserReq("newUser");
    });

    afterEach(async () => {
      await User.deleteMany({});
    });

    it("should return 200 and create an user with a valid request", async () => {
      const res = await execute();
      expect(res).status(200);
      expect(res.body.firstName).to.be.eql(newUser.firstName);
      expect(res.body.lastName).to.be.eql(newUser.lastName);
      expect(res.body).to.not.have.property("password");
      expect(res.header).to.have.property("x-auth-token");
    });

    it("should return 400 with an invalid request 1", async () => {
      newUser.isAdmin = true;
      const res = await execute();
      expect(res).status(400);
    });

    it("should return 400 with an invalid request 2", async () => {
      newUser.password = "1234";
      const res = await execute();
      expect(res).status(400);
    });

    it("should return 400 with an invalid request 3", async () => {
      newUser.firstName = "";
      const res = await execute();
      expect(res).status(400);
    });

    it("should return 400 with an invalid request 4", async () => {
      newUser.email = "123@";
      const res = await execute();
      expect(res).status(400);
    });

    it("should return 400 with an invalid request 5", async () => {
      await genUsersDB(1);
      newUser.email = users_db[0].email;
      const res = await execute();
      expect(res).status(400);
    });
  });

  describe("Put User ~/me", () => {});
});
