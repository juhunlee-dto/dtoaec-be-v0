const express = require("express");
const router = express.Router();
const validateObjectId = require("../middlewares/validateObjectId");
const validateReq = require("../middlewares/validateReq");
const auth = require("../middlewares/auth");
const admin = require("../middlewares/admin");
const { User, validate } = require("../models/user");
const _ = require("lodash");

router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  if (!user) return res.status(404).send("not found");
  return res.send(user);
});

router.get("/:id", validateObjectId, async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) return res.status(404).send("not found");
  res.send(user);
});

router.post("/", [validateReq(validate)], async (req, res) => {
  //check if the email is already registered
  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("This email is already registered");

  //Admin will be manually added to db
  user = new User(
    _.pick(req.body, ["firstName", "lastName", "email", "password"])
  );
  //encrypt password and save
  user.encryptPassword();
  await user.save();

  //add x-auth-token header to res
  const token = user.generateUserAuthToken();
  res
    .header("x-auth-token", token)
    .send(_.pick(user, ["_id", "firstName", "lastName", "email"]));
});

module.exports = router;
