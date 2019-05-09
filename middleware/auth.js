
const express = require('express');
const User = require('../models/user');
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require('../config')

const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const { authenticateJWT } = require("../middleware/auth");



/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/

router.post('/login', async function(req, res, next){
  try {
    const { username, password } = req.body;
    const isAuth = await User.authenticate(username, password);
    if (isAuth) {
      let token = jwt.sign({ username }, SECRET_KEY);
      return res.json({ token })
    }
    throw new ExpressError("Invalid user/password",400);
  } catch (error) {
    return next(error);
  }
})


/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */

module.exports = router;