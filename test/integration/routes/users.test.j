// const request = require("supertest");
// const mongoose = require("mongoose");
// const { User } = require("../../../models/user");

// describe("/api/users", () => {
//   let server;

//   beforeEach(() => {
//     server = require("../../../index");
//   });
//   afterEach(async () => {
//     await server.close();
//   });

//   describe("GET /", () => {
//     let user1;
//     let user2;
//     let token;
//     let param = "";
//     const execute = () => {
//       return request(server)
//         .get("/api/users/" + param)
//         .set("x-auth-token", token)
//         .send();
//     };

//     beforeEach(async () => {
//       user1 = new User({
//         firstName: "Name1",
//         lastName: "Surname1",
//         email: "dto_user1@dto.com",
//         password: "1234!@#$QWERqwer",
//         isAdmin: true
//       });
//       user2 = new User({
//         firstName: "Name2",
//         lastName: "Surname2",
//         email: "dto_user2@dto.com",
//         password: "1234!@#$QWERqwer",
//         isAdmin: false
//       });
//       token = user1.generateUserAuthToken();
//       await User.insertMany([user1, user2]);
//     });

//     afterEach(async () => {
//       await User.deleteMany({});
//     });

//     it("should return a user (self) with a valid request", async () => {
//       param = "me";
//       const res = await execute();
//       expect(res.status).toBe(200);
//       expect(res.body.firstName).toMatch("Name1");
//       expect(res.body.lastName).toMatch("Surname1");
//       expect(res.body.password).toBeUndefined();
//     });

//     it("should return a user with a valid id", async () => {
//       const user1_db = await User.findOne({ email: "dto_user1@dto.com" });
//       param = user1_db._id.toHexString();
//       const res = await execute();
//       expect(res.status).toBe(200);
//       expect(res.body.firstName).toMatch("Name1");
//       expect(res.body.lastName).toMatch("Surname1");
//       expect(res.body.password).toBeUndefined();
//     });

//     it("should return 401 if user is not logged in", async () => {
//       param = "me";
//       token = "";
//       const res = await execute();
//       expect(res.status).toBe(401);
//     });

//     it("should return 400 with an invalid user id", async () => {
//       param = "1231242jasdflase0";
//       const res = await execute();
//       expect(res.status).toBe(400);
//     });

//     it("should return 404 if no user found with the given id", async () => {
//       param = mongoose.Types.ObjectId().toHexString();
//       const res = await execute();
//       expect(res.status).toBe(404);
//     });
//   });

//   describe("POST /", () => {
//     let firstName;
//     let lastName;
//     let email;
//     let password;
//     const execute = () => {
//       return request(server)
//         .post("/api/users/")
//         .send({
//           email: email,
//           password: password,
//           firstName: firstName,
//           lastName: lastName
//         });
//     };

//     beforeEach(async () => {
//       firstName = "Name1";
//       lastName = "Surname1";
//       email = "user1@dto.com";
//       password = "1234!@#$qwerQWER";
//     });

//     afterEach(async () => {
//       await User.deleteMany({});
//     });

//     it("should register and return a user with a valid request", async () => {
//       const res = await execute();
//       expect(res.status).toBe(200);
//       expect(res.body.firstName).toMatch("Name1");
//       expect(res.body.lastName).toMatch("Surname1");
//       expect(res.body.password).toBeUndefined();
//       const user_db = await User.findOne({ email: email });
//       const token_db = user_db.generateUserAuthToken();
//       expect(res.header["x-auth-token"]).toMatch(token_db);
//     });
//   });
// });
