process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../../app");
let db = require("../../db");

// import helper stuff for creating databases
const { createAllTables, insertIntoCompanies, insertIntoJobs } = require("../../helpers/testHelpers");

const { UCSF, JRSPECIALIST } = require("../../helpers/testHelpers");

// Create a new table and insert before each database
beforeEach(async function () {
  await createAllTables();
  await insertIntoCompanies(UCSF);
  await insertIntoJobs(JRSPECIALIST);
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

  test("Route returns 400 if invalid keys in the job posting", async function () {
    const response = await request(app).post(`/jobs`)
      .send({
        asdf: "32432432",
        adsfasd: 1234532432,
        adsfads: 32432432,
        adfdas: ""
      });
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      "message":
        ["instance requires property \"title\"",
          "instance requires property \"salary\"",
          "instance requires property \"equity\"", "instance requires property \"company_handle\""], "status": 400
    });
  })
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