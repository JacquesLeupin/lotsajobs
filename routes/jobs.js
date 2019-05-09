const express = require("express")
const Job = require("../models/job")
const jsonschema = require("jsonschema")
const ExpressError = require("../helpers/expressError")
const { validateJobData, validateJobPatchData } = require('../middleware')

const router = new express.Router()

// READ /jobs -- return all the jobs based on the query params
router.get("/", async function (req, res, next) {
  try {

    // No query params specified - show all jobs
    if (Object.getOwnPropertyNames(req.query).length === 0) {
      const jobs = await Job.findAll()
      return res.json({ jobs })
    }
    else { // Find jobs based on the query
      const jobs = await Job.findJobs(req.query)
      return res.json({ jobs })
    }
  } catch (err) {
    return next(err)
  }
})

/**  Read by id. Get JSON of a specific job based on id
 */
router.get("/:id", async function (req, res, next) {
  try {

    const { id } = req.params
    const job = await Job.findById(id)

    if (!job) {
      return next(new ExpressError("Job not found"), 404)
    }
    return res.json(job)
  } catch (err) {
    return next(err)
  }
})


// CREATE a job, returns a job object created
router.post("/", validateJobData, async function (req, res, next) {
  try {
    const job = await Job.create(req.body)
    return res.json({ job })
  } catch (err) {
    return next(err)
  }
})


// UPDATE a job based on id, with any of the data provided
router.patch("/:id", validateJobPatchData, async function (req, res, next) {
  try {
    const { id } = req.params
    // if job doesn't exist, we can't update
    if (!(await Job.findById(id))) {
      return next(new ExpressError("Job not found", 404))
    }
    // Update the job
    const job = await Job.update(id, req.body)
    return res.json({ job })
  } catch (err) {
    return next(err)
  }
})

// Remove a job by ID
router.delete("/:id", async function (req, res, next) {
  try {

    const { id } = req.params
    const job = await Job.delete(id)
    // Delete if the job exists
    if (job) {
      return res.json({ message: "Job deleted" })
    } else {
      return res.json({ message: "Job does not exist" })
    }
  } catch (err) {
    return next(err)
  }
})

module.exports = router