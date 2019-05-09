const express = require("express")
const User = require("../models/user")
const jsonschema = require("jsonschema")
const ExpressError = require("../helpers/expressError")
const { CHANGEME, CHANGME } = require('../middleware')

const router = new express.Router()

// Read companies
router.get("/", async function (req, res, next) {
    try {
      // If there are no query parameters, \
        const users = await User.findAll()
        return res.json({ users })
    } catch (err) {
      return next(err)
    }
  })
  
  // Creation of a user
  router.post("/", async function (req, res, next) {
    try {
      const user = await User.create(req.body)
      return res.json(user)
    } catch (err) {
      return next(err)
    }
  })
  
  
  // Read by handle. Get JSON of a specific company based on handle
  router.get("/:handle", async function (req, res, next) {
    try {
  
      const { handle } = req.params
  
      // Send out two db queries at same time for company and jobs
      const companyPromise = Company.findByHandle(handle)
      const jobsPromise = Company.findAllJobsFromCompanyHandle(handle);
      
      let [company, jobs] = await Promise.all([companyPromise, jobsPromise])
      
      // If company cannot be found, then send a not found error
      if (!company) {
        return next(new ExpressError("Company not found!", 404))
      }
      return res.json({company, jobs})
    } catch (err) {
      return next(err)
    }
  })
  
  
  // Update a company based on handle, with any of the provided
  router.patch("/:handle", async function (req, res, next) {
    try {
      const { handle } = req.params
  
      // If the company handle does not exist in the database, return a company not found.
      if (!(await Company.findByHandle(handle))) {
        return next(new ExpressError("Company not found!", 404))
      }
  
      // Update the company
      const company = await Company.update(handle, req.body)
      return res.json({ company })
    } catch (err) {
      return next(err)
    }
  })
  
  // Remove by handle
  router.delete("/:handle", async function (req, res, next) {
    try {
      const { handle } = req.params
      const company = await Company.delete(handle)
  
      // Delete if the company exists
      if (company) {
        return res.json({ message: "Company deleted" })
      } else {
        return res.json({ message: "Company does not exist"})
      }
    } catch (err) {
      return next(err)
    }
  })

module.exports = router