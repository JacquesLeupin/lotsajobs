const express = require("express");
const Company = require("../models/company");
const jsonschema = require("jsonschema");
const ExpressError = require("../helpers/expressError");
const { validateCompanyData, validateCompanyPatchData } = require('../middleware/inputDataValidation');
const { ensureLoggedIn } = require("../middleware/auth");
const { ensureAdmin } = require("../middleware/auth");
const { authenticateUser } = require("../middleware/auth");

const router = new express.Router();

router.use(authenticateUser);
// Read companies
router.get("/", ensureLoggedIn, async function (req, res, next) {
  try {
    // If there are no query parameters, then GET will return all the companies
    const queryParams = Object.getOwnPropertyNames(req.query).length;

    if (!queryParams) {
      const companies = await Company.findAll();
      return res.json({ companies });
    } else { // If there are query parameters, check if they are valid
      // refactor for camelCase with query params
      const { min_employees, max_employees } = req.query;
      if (min_employees && max_employees && +min_employees > +max_employees) {
        return next(new ExpressError("Please give a valid range", 400));
      }

      // Nothing wrong with query parameters, find the specific companie(s) matching those queries
      const company = await Company.findCompanies(req.query);
      return res.json({ company });
    }

  } catch (err) {
    return next(err);
  }
});

// Creation of a company
router.post("/", validateCompanyData, ensureAdmin, async function (req, res, next) {
  
  try {
    const companies = await Company.create(req.body);
    return res.json(companies);
  } catch (err) {
    return next(err);
  }
});


// Read by handle. Get JSON of a specific company based on handle
router.get("/:handle", ensureLoggedIn, async function (req, res, next) {
  try {

    const { handle } = req.params;
    // Send out two db queries at same time for company and jobs
    const companyPromise = Company.findByHandle(handle);
    const jobsPromise = Company.findAllJobsFromCompanyHandle(handle);
    
    let [company, jobs] = await Promise.all([companyPromise, jobsPromise]);
    
    // If company cannot be found, then send a not found error
    if (!company) {
      return next(new ExpressError("Company not found!", 404));
    }
    return res.json({company, jobs});
  } catch (err) {
    return next(err);
  }
});


// Update a company based on handle, with any of the provided
router.patch("/:handle", validateCompanyPatchData, ensureAdmin, async function (req, res, next) {
  try {
    const { handle } = req.params;
    const handleExists = (await Company.findByHandle(handle));
    // If the company handle does not exist in the database, return a company not found.
    if (!(handleExists)) {
      return next(new ExpressError("Company not found!", 404));
    }

    // Update the company
    const company = await Company.update(handle, req.body);
    return res.json({ company });
  } catch (err) {
    return next(err);
  }
});

// Remove by handle
router.delete("/:handle", ensureAdmin, async function (req, res, next) {
  try {
    const { handle } = req.params;
    const company = await Company.delete(handle);

    // Delete if the company exists
    company ? res.json({ message: "Company deleted" }) : res.json({ message: "Company does not exist"});
  
  }
  catch (err) {
    return next(err);
  }
});

module.exports = router;