const express = require("express")
const Company = require("../models/company")
const jsonschema = require("jsonschema")
const ExpressError = require("../helpers/expressError")

const router = new express.Router()

router.get("/", async function (req, res, next) {
  try {
  const company = await Company.findCompanies(req.query)
  return res.json({company})  
  } catch (err) {
    return next(err);
  }
});

router.post("/", async function (req, res, next) {
  try {
    const { data } = req.body
    const companies = await Company.create(data) 
    return res.json(companies) 
  } catch (err) {
    return next(err);
  }
});

router.get("/:handle", async function (req, res, next) {
  try {

    const { handle } = req.params
    const company = await Company.findByHandle(handle)
    if(!company){
        return next(new ExpressError("Company not found!", 404))
    }
    return res.json(company) 
  } catch (err) {
    return next(err);
  }
});

router.patch("/:handle", async function (req, res, next) {
  try {
    const { handle } = req.params
    const company = await Company.update(handle, req.body)
    return res.json({company})  
  } catch (err) {
    return next(err);
  }
});

router.delete("/:handle", async function (req, res, next) {
  try {
    const { handle } = req.params
    const company = await Company.delete(handle)
    return res.json({company}) 
  } catch (err) {
    return next(err);
  }
});
module.exports = router