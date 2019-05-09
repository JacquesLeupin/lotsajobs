/** Middleware for handling req authorization for routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const ExpressError = require("../helpers/expressError");

/** Middleware: Authenticate user and sign JWT token. */

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

/** Middleware: Requires user is authenticated and ensures user is loggend in. */

function ensureLoggedIn(req, res, next) {
  if (!req.user) {
    return next({ status: 401, message: "Unauthorized" });
  } else {
    return next();
  }
}

/** Middleware: Requires correct username, and ensures that the users is correct. */


function ensureCorrectUser(req, res, next) {
  try {
    const tokenStr = req.body._token;

    let token = jwt.verify(tokenStr, SECRET_KEY);
    res.locals.username = token.username;

    if (token.username === req.params.username) {
      return next();
    }

    // throw an error if user isn't correct, so we catch it in our catch, below
    throw new Error();
  } catch (err) {
    return next(new ExpressError("Unauthorized", 401));
  }
}

function ensureAdmin(req, res, next) {
  try {

    const tokenStr = req.body._token;
    let token = jwt.verify(tokenStr, SECRET_KEY);
    res.locals.username = token.username;

    if (token.isAdmin) {
      return next();
    }

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
