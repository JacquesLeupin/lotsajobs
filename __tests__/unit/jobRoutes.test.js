process.env.NODE_ENV = "test"

const request = require("supertest")
const app = require("../../app")

let db = require("../../db")

const jsJob = {
  title: "Junior Specialist",
  salary: 35678,
  equity: 0,
  company_handle: "UCSF",
}

const UCSF = {
  "handle": "UCSF",
  "name": "University of California San Francisco",
  "num_employees": 2000,
  "description": "hospital stuff",
  "logo_url": "lolgetoutofhere"
}

beforeEach(function () {
  // Insert a job
  db.query(`INSERT INTO jobs (
                title,
                salary,
                equity,
                company_handle,
                date_posted)
                VALUES ($1, $2, $3, $4, current_timestamp)`, [
      jsJob.title,
      jsJob.salary,
      jsJob.equity,
      jsJob.company_handle,
    ])

  // Insert a company for that JOB
  db.query(`INSERT INTO companies (
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
    ])
})


afterEach(function () {

  db.query(`TRUNCATE TABLE jobs, companies`)
})


// CRUD - Read route 
// describe("GET /companies", function () {


//   test("Gets a list of all companies", async function () {
//     const response = await request(app).get(`/companies`);
//     expect(response.statusCode).toBe(200);
//     expect(response.body).toEqual({ "companies": [{ "description": "Where Jax used to work", "handle": "AROUND", "logo_url": "lolgetoutofhere", "name": "getAround", "num_employees": 2000 }] })
//   })
//   // Test the gets with query parameters

//   test("Gets a list of all companies", async function () {
//     const response = await request(app).get(`/companies?search=getAround`);
//     expect(response.statusCode).toBe(200);
//     expect(response.body).toEqual({ "company": [{ "handle": "AROUND", "name": "getAround" }] })
//   })

//   test("Return 404 for invalid query params", async function () {
//     const response = await request(app).get(`/companies?search=getAround&min_employees=3000&max_employees=200`);
//     expect(response.statusCode).toBe(400);
//     expect(response.body).toEqual({ "message": "Please give a valid range", "status": 400 })
//   })

//   test("Return specific company based on valid query params", async function () {
//     const response = await request(app).get(`/companies?min_employees=300&max_employees=2001`);
//     expect(response.statusCode).toBe(200);
//     expect(response.body).toEqual({ "company": [{ "handle": "AROUND", "name": "getAround" }] })
//   })

//   test("Return nothing if no companies satisfy valid query params", async function () {
//     const response = await request(app).get(`/companies?min_employees=300&max_employees=2000`);
//     expect(response.statusCode).toBe(200);
//     expect(response.body).toEqual({ "company": [] })
//   })
// })

// create a new job
describe("POST /jobs", function () {

  test("Route returns 404 if invalid keys in the job posting", async function () {
    const response = await request(app).post(`/jobs`)
      .send({
        asdf: "32432432",
        adsfasd: 1234532432,
        adsfads: 32432432,
        adfdas: ""
      });
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual();

    test("Route successfully posts the job posting", async function () {
      const response = await request(app).post(`/jobs`)
        .send({
          title: "Singer",
          salary: 12345,
          equity: 0.5,
          company_handle: "UCSF"
        });
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        title: "Singer",
        salary: 12345,
        equity: 0.5,
        company_handle: "UCSF"
      })
    })
  })
})
