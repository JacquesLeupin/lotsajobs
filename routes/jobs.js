const express = require("express");
const Job = require("../models/job");
const jsonschema = require("jsonschema");
const ExpressError = require("../helpers/expressError");
const { validateJobData, validateJobPatchData } = require('../middleware/inputDataValidation');
const { ensureLoggedIn } = require("../middleware/auth");
const { ensureAdmin } = require("../middleware/auth");
const { authenticateUser } = require("../middleware/auth");


const router = new express.Router();
router.use(authenticateUser);

// READ /jobs -- return all the jobs based on the query params
router.get("/", ensureLoggedIn, async function (req, res, next) {
  try {
    const queryParams = Object.getOwnPropertyNames(req.query).length;
    // No query params specified - show all jobs
    if (!queryParams) {
      const jobs = await Job.findAll();
      return res.json({ jobs });
    }
    else { // Find jobs based on the query
      const jobs = await Job.findJobs(req.query);
      return res.json({ jobs });
    }
  } catch (err) {
    return next(err);
  }
});

/**  Read by id. Get JSON of a specific job based on id
 */
router.get("/:id", ensureLoggedIn, async function (req, res, next) {
  try {

    const { id } = req.params;
    const job = await Job.findById(id);

    //if job doesn't exist, return new Error, else return json of job data
    !job ? next(new ExpressError("Job not found"), 404) : res.json(job);

  } catch (err) {
    return next(err);
  }
});


// CREATE a job, returns a job object created
router.post("/", ensureAdmin, validateJobData, async function (req, res, next) {
  try {
    const job = await Job.create(req.body);
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});


// UPDATE a job based on id, with any of the data provided
router.patch("/:id", ensureAdmin, validateJobPatchData, async function (req, res, next) {
  try {
    const { id } = req.params;
    const jobExists = await Job.findById(id);
    
    // if job doesn't exist, we can't update
    if (!jobExists) {
      return next(new ExpressError("Job not found", 404));
    }
    // Update the job
    const job = await Job.update(id, req.body);
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});

// Remove a job by ID
router.delete("/:id", ensureAdmin, async function (req, res, next) {
  try {

    const { id } = req.params;
    const job = await Job.delete(id);
    // Delete if the job exists
    job ? res.json({ message: "Job deleted" }) : res.json({ message: "Job does not exist" });
    
  } catch (err) {
    return next(err);
  }
});

module.exports = router;