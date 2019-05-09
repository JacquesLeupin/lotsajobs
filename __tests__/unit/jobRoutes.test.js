process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../../app");
let db = require("../../db");

// Test job and test company
const jsJob = {
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

// Mock time stamp
const CURRENT_TIME_STAMP = "2019-05-09T00:56:21.186Z";


// Create a new table and insert before each database
beforeEach(async function () {

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

  // Insert a company for that JOB
  await db.query(`INSERT INTO companies (
              handle,
              name,
              num_employees,
              description,
              logo_url)
              VALUES ($1, $2, $3, $4, $5)`, [
    UCSF.handle,
    UCSF.name,
    UCSF.num_employees,
    UCSF.description,
    UCSF.logo_url
  ]);


  // Insert a job
  db.query(`INSERT INTO jobs (
                title,
                salary,
                equity,
                company_handle,
                date_posted)
                VALUES ($1, $2, $3, $4, $5)`, [
    jsJob.title,
    jsJob.salary,
    jsJob.equity,
    jsJob.company_handle,
    CURRENT_TIME_STAMP
  ]);

});

// Drop entire table
afterEach(async function () {

  await db.query(`DROP TABLE IF EXISTS companies, jobs`);
});

// End the database session
afterAll(async function () {
  await db.end();
});


// Create a new job
describe("POST /jobs", function () {


  test("Route successfully posts the job posting", async function () {
    const response = await request(app).post(`/jobs`)
      .send({
        title: "Singer",
        salary: 12345,
        equity: 0.66,
        company_handle: "UCSF"
      });
    expect(response.statusCode).toBe(200);
    expect(response.body.job.title).toEqual("Singer");
    expect(response.body.job.salary).toEqual(12345);
    expect(response.body.job.equity).toEqual(0.66);
    expect(response.body.job.company_handle).toEqual("UCSF");

  });

  // test("Route returns 404 if invalid keys in the job posting", async function () {
  //   const response = await request(app).post(`/jobs`)
  //     .send({
  //       asdf: "32432432",
  //       adsfasd: 1234532432,
  //       adsfads: 32432432,
  //       adfdas: ""
  //     });
  //   expect(response.statusCode).toBe(400);
  //   expect(response.body).toEqual();
  // })
});

// Read routes
describe("READ: GET /jobs", function () {

  // Lists all jobs if no query strings are passed
  test("Gets a list of all jobs", async function () {
    const response = await request(app).get(`/jobs`);
    expect(response.statusCode).toBe(200);
    expect(response.body.jobs).toHaveLength(1);
  });

  // Test the gets with query parameters
  test("Gets a list of all companies that match the title", async function () {
    const response = await request(app).get(`/jobs?title=JrSpecialist`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ "jobs": [{ "company_handle": "UCSF", "title": "JrSpecialist" }] });
  });


  test("Return specific company based on valid query params", async function () {
    const response = await request(app).get(`/jobs?min_salary=3000&min_equity=0`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ "jobs": [{ "company_handle": "UCSF", "title": "JrSpecialist" }] });
  });

  test("Return nothing if no jobs satisfy valid query params", async function () {
    const response = await request(app).get(`/jobs?min_salary=999999`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ "jobs": [] });
  });
});

// Update a job by id
describe("PATCH /jobs/:id", function () {
  test("Successfully updates a single job posting by id", async function () {

    const result = await db.query(`SELECT * from jobs`);
    const response = await request(app)
      .patch(`/jobs/1`)
      .send({
        title: "JrSpecialistII",
        salary: 40000,
        equity: 0.2,
        company_handle: "UCSF",
      });

    expect(response.statusCode).toBe(200);

    expect(response.body).toEqual({
      "job": {
        "company_handle": "UCSF",
        "date_posted": "2019-05-09T07:56:21.186Z",
        "equity": 0.2,
        "id": 1,
        "salary": 40000,
        "title": "JrSpecialistII",
      },
    }
    );
  });

  // invalid job id - id does not exist
  test("Responds with 404 if id invalid", async function () {
    const response = await request(app).patch(`/jobs/22`)
      .send({
        title: "JrSpecialistII",
        salary: 40000,
        equity: 0.2,
        company_handle: "UCSF",
      });

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toEqual("Job not found");
  });

  // invalid job id - id isn't an integer
  test("Responds with 404 if id invalid", async function () {
    const response = await request(app).patch(`/jobs/akdsfj`)
      .send({
        title: "JrSpecialistII",
        salary: 40000,
        equity: 0.2,
        company_handle: "UCSF",
      });

    expect(response.statusCode).toBe(500);
    expect(response.body.message).toEqual('invalid input syntax for integer: "akdsfj"');
  });
});//


// Delete a job
describe("DELETE /jobs/:id", function () {
  test("Deletes a single a job by id", async function () {
    const response = await request(app).delete(`/jobs/1`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ message: "Job deleted" });
  });
});