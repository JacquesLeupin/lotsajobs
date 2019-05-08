const express = require("express")
const Job = require("../models/job")
const jsonschema = require("jsonschema")
const ExpressError = require("../helpers/expressError")
const { CHANGEME } = require('../middleware')

const router = new express.Router()

router.get("/", async function (req, res, next) {
    try {
      // If there are no query parameters, then GET will return all the companies
    } catch (err) {
      return next(err)
    }
  })
  
  // Creation of a company
  router.post("/", async function (req, res, next) {
    try {
        const job = await Job.create(req.body)
        return res.json(job)
    } catch (err) {
      return next(err)
    }
  })
  
  
  // Read by handle. Get JSON of a specific company based on handle
  router.get("/:handle", async function (req, res, next) {
    try {
  
      const { handle } = req.params
  
      return res.json(company)
    } catch (err) {
      return next(err)
    }
  })
  
  
  // Update a company based on handle, with any of the provided
  router.patch("/:handle", async function (req, res, next) {
    try {
      const { handle } = req.params
  
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