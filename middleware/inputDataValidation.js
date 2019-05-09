const jsonschema = require("jsonschema");
const companySchema = require("../schemas/companySchema.json");
const companyPatchSchema = require("../schemas/companyPatchSchema.json");
const jobSchema = require("../schemas/jobSchema.json");
const jobPatchSchema = require("../schemas/jobPatchSchema.json");
const userSchema = require("../schemas/userSchema.json");
const userPatchSchema = require("../schemas/userPatchSchema.json");
const ExpressError = require("../helpers/expressError");


/** Validator for company data. Ensures the keys:
 * handle (string), name (string), num_employees (integer), description (string), logo_url (string)
 */
function validateCompanyData(req, res, next) {
  
  const result = jsonschema.validate(req.body, companySchema);
  
  if (!result.valid) {
    let listOfErrors = result.errors.map(err => err.stack);
    let error = new ExpressError(listOfErrors, 400);
    return next(error);
  } 
  return next();
}

/** Validator for company data for patching. All are optional
 * handle (string), name (string), num_employees (integer), description (string), logo_url (string)
 */
function validateCompanyPatchData(req, res, next) {
  
  const result = jsonschema.validate(req.body, companyPatchSchema);
  
  if (!result.valid) {
    let listOfErrors = result.errors.map(err => err.stack);
    let error = new ExpressError(listOfErrors, 400);
    return next(error);
  } 
  return next();
}

function validateJobData(req, res, next) {
  
  const result = jsonschema.validate(req.body, jobSchema);
  
  if (!result.valid) {
    let listOfErrors = result.errors.map(err => err.stack);
    let error = new ExpressError(listOfErrors, 400);
    return next(error);
  } 
  return next();
}

function validateJobPatchData(req, res, next) {
  
  const result = jsonschema.validate(req.body, jobPatchSchema);
  
  if (!result.valid) {
    let listOfErrors = result.errors.map(err => err.stack);
    let error = new ExpressError(listOfErrors, 400);
    return next(error);
  } 
  return next();
}

function validateUserData(req, res, next) {
  
  const result = jsonschema.validate(req.body, userSchema);
  
  if (!result.valid) {
    let listOfErrors = result.errors.map(err => err.stack);
    let error = new ExpressError(listOfErrors, 400);
    return next(error);
  } 
  return next();
}

function validateUserPatchData(req, res, next) {
  
  const result = jsonschema.validate(req.body, userPatchSchema);
  
  if (!result.valid) {
    let listOfErrors = result.errors.map(err => err.stack);
    let error = new ExpressError(listOfErrors, 400);
    return next(error);
  } 
  return next();
}
module.exports = { validateCompanyData, validateCompanyPatchData, validateJobData, validateJobPatchData, validateUserData, validateUserPatchData };