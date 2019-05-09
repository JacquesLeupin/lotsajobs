/** Middleware for handling req authorization for routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const ExpressError = require("../helpers/expressError");
// Middleware to track our paths


/** Middleware: Authenticate user. */

function authenticateUser(req, res, next) {
  try {
    const tokenFromBody = req.body._token;
    const payload = jwt.verify(tokenFromBody, SECRET_KEY);
    req.user = payload;
    return next();
  } catch (err) {
    return next();
  }
}
// end

/** Middleware: Requires user is authenticated. */

function ensureLoggedIn(req, res, next) {
  if (!req.user) {
    return next({ status: 401, message: "Unauthorized" });
  } else {
    return next();
  }
}

// end

/** Middleware: Requires correct username. */


function ensureCorrectUser(req, res, next) {
  try {
    const tokenStr = req.body._token;

    let token = jwt.verify(tokenStr, SECRET_KEY);
    res.locals.username = token.username;

    if (token.username === req.params.username) {
      return next();
    }

    // throw an error, so we catch it in our catch, below
    throw new Error();
  } catch (err) {
    return next(new ExpressError("Unauthorized", 401));
  }
}

function ensureAdmin(req, res, next) {
  try {
    const tokenStr = req.body._token;
    console.log(1, tokenStr);
    let token = jwt.verify(tokenStr, SECRET_KEY);
    console.log(2, token);
    res.locals.username = token.username;
    console.log(3, token.username === req.params.username)
    console.log(4, token.username)
    console.log(5, token.isAdmin)
    console.log(6, token.isAdmin === true)
    if (token.isAdmin) {
      return next();
    }

    // throw an error, so we catch it in our catch, below
    throw new Error();
  } catch (err) {
    return next(new ExpressError("Unauthorized", 401));
  }
}
// end

module.exports = {
  authenticateUser,
  ensureLoggedIn,
  ensureCorrectUser,
  ensureAdmin
};
