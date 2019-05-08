const express = require("express")
const Company = require("../models/company")
const jsonschema = require("jsonschema")
const ExpressError = require("../helpers/expressError")
const { validateCompanyData, validateCompanyPatchData } = require('../middleware')

const router = new express.Router()

router.get("/", async function (req, res, next) {
  try {
    // below we're checking if there are any query params passed to the route
    if (Object.getOwnPropertyNames(req.query).length === 0) {
      const companies = await Company.findAll()
      return res.json({ companies })
    }
    else {
      let { min_employees, max_employees } = req.query
      if (min_employees && max_employees && +min_employees > +max_employees) {
        return next(new ExpressError("Please give a valid range", 400))
      }
      const company = await Company.findCompanies(req.query)
      return res.json({ company })
    }
  } catch (err) {
    return next(err)
  }
})

router.post("/", validateCompanyData, async function (req, res, next) {
  try {
    const companies = await Company.create(req.body)
    return res.json(companies)
  } catch (err) {
    return next(err)
  }
})

router.get("/:handle", async function (req, res, next) {
  try {

    const { handle } = req.params
    const company = await Company.findByHandle(handle)
    if (!company) {
      return next(new ExpressError("Company not found!", 404))
    }
    return res.json(company)
  } catch (err) {
    return next(err)
  }
})

router.patch("/:handle", validateCompanyPatchData, async function (req, res, next) {
  try {
    const { handle } = req.params

    if (!(await Company.findByHandle(handle))) {
      return next(new ExpressError("Company not found!", 404))
    }
    const company = await Company.update(handle, req.body)
    return res.json({ company })
  } catch (err) {
    return next(err)
  }
})

router.delete("/:handle", async function (req, res, next) {
  try {
    const { handle } = req.params
    const company = await Company.delete(handle)

    if (company) {
      return res.json({ message: "Company deleted" })
    }
  } catch (err) {
    return next(err)
  }
})
module.exports = router