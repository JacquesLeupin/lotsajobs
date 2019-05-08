const jsonschema = require("jsonschema")
const companySchema = require("./schemas/companySchema.json")
const companyPatchSchema = require("./schemas/companyPatchSchema.json")
const ExpressError = require("./helpers/expressError")


function validateCompanyData(req, res, next) {
  
  const result = jsonschema.validate(req.body, companySchema)
  
  if (!result.valid) {
    let listOfErrors = result.errors.map(err => err.stack)
    let error = new ExpressError(listOfErrors, 400)
    return next(error)
  } 
  return next()
}

function validateCompanyPatchData(req, res, next) {
  
  const result = jsonschema.validate(req.body, companyPatchSchema)
  
  if (!result.valid) {
    let listOfErrors = result.errors.map(err => err.stack)
    let error = new ExpressError(listOfErrors, 400)
    return next(error)
  } 
  return next()
}

module.exports = { validateCompanyData, validateCompanyPatchData }