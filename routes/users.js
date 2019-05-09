const express = require("express");
const User = require("../models/user");
const jsonschema = require("jsonschema");
const ExpressError = require("../helpers/expressError");
const jwt = require("jsonwebtoken");
const { validateUserData, validateUserPatchData } = require('../middleware/inputDataValidation');
const { SECRET_KEY } = require('../config');

const router = new express.Router();

// Read users
router.get("/", async function (req, res, next) {
  try {
    const users = await User.findAll();
    return res.json({ users });
  } catch (err) {
    return next(err);
  }
});

// Creation of a user
router.post("/", validateUserData, async function (req, res, next) {
  try {
    const user = await User.create(req.body);
    const token = jwt.sign({user: user.username}, SECRET_KEY);

    return res.json({ user: { username: user.username, firstname: user.first_name, lastname: user.last_name, email: user.email }, token: token});
  } catch (err) {
    return next(err);
  }
});


// Read by username. Get JSON of a specific user based on handle
router.get("/:username", async function (req, res, next) {
  try {

    const { username } = req.params;

    const user = await User.findByUsername(username);

    if (!user) {
      return next(new ExpressError("User not found!", 404));
    }
    return res.json({ user: { username: user.username, firstname: user.first_name, lastname: user.last_name, email: user.email, photo_url: user.photo_url } });
  } catch (err) {
    return next(err);
  }
});


// Update a user based on username, with any data provided
router.patch("/:username", validateUserPatchData, async function (req, res, next) {
  try {
    const { username } = req.params;
    // If the user username does not exist in the database, return a user not found.
    if (!(await User.findByUsername(username))) {
      return next(new ExpressError("User not found!", 404));
    }

    // Update the User
    const user = await User.update(username, req.body);
    return res.json({ user: { username: user.username, firstname: user.first_name, lastname: user.last_name, email: user.email, photo_url: user.photo_url } });
  } catch (err) {
    return next(err);
  }
});

// Remove by username
router.delete("/:username", async function (req, res, next) {
  try {
    const { username } = req.params;
    const user = await User.delete(username);

    // Delete if the user exists
    if (user) {
      return res.json({ message: "User deleted" });
    } else {
      return res.json({ message: "User does not exist" });
    }
  } catch (err) {
    return next(err);
  }
});

module.exports = router;