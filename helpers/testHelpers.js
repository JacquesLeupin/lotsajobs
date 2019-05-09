/** Helper functions to use for the test files */
let db = require("../db");

// Helper constants
const CURRENT_TIME_STAMP = "2019-05-09T00:56:21.186Z";
const JRSPECIALIST = {
  title: "JrSpecialist",
  salary: 35678,
  equity: 0.1,
  company_handle: "UCSF",
};

const UCSF = {
  handle: "UCSF",
  name: "University of California San Francisco",
  num_employees: 2000,
  description: "hospital stuff",
  logo_url: "lolgetoutofhere"
};

const AROUNDCOMPANY = {
  handle: "AROUND",
  name: "getAround",
  num_employees: 2000,
  description: "Where Jax used to work",
  logo_url: "lolgetoutofhere"
};

const NOOBUSER = {
  username: "noobuser",
  password: "noob",
  first_name: "Noobie",
  last_name: "Saurus",
  email: "Noobasaurus@noobland.com",
  photo_url: "noob.com",
  is_admin: false
};

const ADMIN = {
  username: "admin",
  password: "password",
  first_name: "Appleseed",
  last_name: "Dingushead",
  email: "admin@admin.com",
  photo_url: "pro.com",
  is_admin: true
}


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
  );
  
  CREATE TABLE users (
    username TEXT PRIMARY KEY,
    password TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL, 
    email TEXT NOT NULL UNIQUE,
    photo_url TEXT,
    is_admin BOOLEAN DEFAULT false NOT NULL
  );`);
}

async function dropAllTables() {
  await db.query(`DROP TABLE IF EXISTS companies, jobs, users`);
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
  dropAllTables,
  insertIntoCompanies,
  insertIntoJobs,
  CURRENT_TIME_STAMP,
  JRSPECIALIST,
  UCSF,
  AROUNDCOMPANY,
  NOOBUSER,
  ADMIN
};