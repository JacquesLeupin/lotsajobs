const express = require("express")
const Company = require("../models/company")
const jsonschema = require("jsonschema")
const ExpressError = require("../helpers/expressError")
const { validateCompanyData, validateCompanyPatchData } = require('../middleware')

const router = new express.Router()


// Read companies
router.get("/", async function (req, res, next) {
  try {
    // If there are no query parameters, then GET will return all the companies
    if (Object.getOwnPropertyNames(req.query).length === 0) {
      const companies = await Company.findAll()
      return res.json({ companies })
    }
    else { // If there are query parameters, check if they are valid
      let { min_employees, max_employees } = req.query
      if (min_employees && max_employees && +min_employees > +max_employees) {
        return next(new ExpressError("Please give a valid range", 400))
      }

      // Nothing wrong with query paramters, find the specific companie(s) matching those queries
      const company = await Company.findCompanies(req.query)
      return res.json({ company })
    }
  } catch (err) {
    return next(err)
  }
})

// Creation of a company
router.post("/", validateCompanyData, async function (req, res, next) {
  try {
    const companies = await Company.create(req.body)
    return res.json(companies)
  } catch (err) {
    return next(err)
  }
})


// Read by handle. Get JSON of a specific company based on handle
router.get("/:handle", async function (req, res, next) {
  try {

    const { handle } = req.params

    // If company cannot be found, then send a not found error
    const company = await Company.findByHandle(handle)
    if (!company) {
      return next(new ExpressError("Company not found!", 404))
    }
    return res.json(company)
  } catch (err) {
    return next(err)
  }
})


// Update a company based on handle, with any of the provided
router.patch("/:handle", validateCompanyPatchData, async function (req, res, next) {
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