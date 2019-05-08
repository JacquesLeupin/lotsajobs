/** Express app for jobly. */

const express = require("express")
const ExpressError = require("./helpers/expressError")
const morgan = require("morgan")
const app = express()
const companiesRoutes = require('./routes/companies')

app.use(express.json())
// add logging system
app.use(morgan("tiny"))
app.use('/companies', companiesRoutes)

/** 404 handler */

app.use(function(req, res, next) {
  const err = new ExpressError("Not Found", 404)

  // pass the error to the next piece of middleware
  return next(err)
})

/** general error handler */

app.use(function(err, req, res, next) {
  res.status(err.status || 500)

  if (process.env.NODE_ENV !== "test") {
    console.error(err.stack)
  }

  return res.json(
    new ExpressError(err.message, err.status)
    )
})

module.exports = app
