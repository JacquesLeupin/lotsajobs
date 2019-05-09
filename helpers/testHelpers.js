/** Helper functions to use for the test files */
let db = require("../db");

const CURRENT_TIME_STAMP = "2019-05-09T00:56:21.186Z";


async function createAllTables() {

  await db.query(`
  CREATE TABLE companies (
  handle TEXT PRIMARY KEY,
  name TEXT,
  num_employees INTEGER,
  description TEXT, 
  logo_url TEXT
  );
  
  CREATE TABLE jobs (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  salary FLOAT NOT NULL,
  equity FLOAT CHECK (equity > 0 AND equity <1) NOT NULL, 
  company_handle TEXT REFERENCES companies ON DELETE CASCADE,
  date_posted TIMESTAMP WITHOUT TIME ZONE NOT NULL
  );`);
}

async function insertIntoCompanies(company) {
  await db.query(`INSERT INTO companies (
      handle,
      name,
      num_employees,
      description,
      logo_url)
      VALUES ($1, $2, $3, $4, $5)`, [
    company.handle,
    company.name,
    company.num_employees,
    company.description,
    company.logo_url
  ]);
}

async function insertIntoJobs(job) {
  db.query(`INSERT INTO jobs (
    title,
    salary,
    equity,
    company_handle,
    date_posted)
    VALUES ($1, $2, $3, $4, $5)`, [
    job.title,
    job.salary,
    job.equity,
    job.company_handle,
    CURRENT_TIME_STAMP
  ]);
}

module.exports = {
  createAllTables,
  insertIntoCompanies,
  insertIntoJobs,
  CURRENT_TIME_STAMP
};