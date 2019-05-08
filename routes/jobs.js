const express = require("express")
const Job = require("../models/job")
const jsonschema = require("jsonschema")
const ExpressError = require("../helpers/expressError")
const { CHANGEME } = require('../middleware')

const router = new express.Router()

router.get("/", async function (req, res, next) {
    try {
     
        if(Object.getOwnPropertyNames(req.query).length === 0){
            const jobs = await Job.findAll()
            return res.json({ jobs })
        }
        else{
            const jobs = await Job.findJobs(req.query)
            return res.json({ jobs })
        }
    } catch (err) {
      return next(err)
    }
  })
  
  // Creation of a company
  router.post("/", async function (req, res, next) {
    try {
        const job = await Job.create(req.body)
        return res.json({ job })
    } catch (err) {
      return next(err)
    }
  })
  
  
  // Read by handle. Get JSON of a specific company based on handle
  router.get("/:id", async function (req, res, next) {
    try {
  
      const { id } = req.params
      const job = await Job.findById(id)
  
      if(!job){
          return next(new ExpressError("Job not found"), 404)
      }
      return res.json(job)
    } catch (err) {
      return next(err)
    }
  })
  
  
  // Update a company based on id, with any of the provided
  router.patch("/:id", async function (req, res, next) {
    try {
      const { id } = req.params
  
      // Update the company
      const job = await Job.update(id, req.body)
      return res.json({ job })
    } catch (err) {
      return next(err)
    }
  })
  
  // Remove by handle
  router.delete("/:id", async function (req, res, next) {
    try {
    
        const  { id } = req.params
        const job = await Job.delete(id)
      // Delete if the company exists
      if (job) {
        return res.json({ message: "Job deleted" })
      } else {
        return res.json({ message: "Job does not exist"})
      }
    } catch (err) {
      return next(err)
    }
  })

module.exports = router