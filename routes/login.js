const express = require("express");
const jsonschema = require("jsonschema");
const ExpressError = require("../helpers/expressError");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { SECRET_KEY } = require("../config");

const router = new express.Router();

router.post("/", async function(req, res, next) {
  try {

    const { username, password } = req.body;
    const user = await User.authenticate(username, password);
    console.log(user)
    const isAdmin = user.is_admin;
    console.log('ISADMINHERE', isAdmin)

    if (user) {
      let token = jwt.sign({ username, isAdmin }, SECRET_KEY);
      return res.json({ token });
    }
    throw new ExpressError("Invalid user/password",400);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;