process.env.NODE_ENV = "test"

const request = require("supertest")
const app = require("../../app")

let db = require("../../db")

const jsJob = {
  title: "JrSpecialist",
  salary: 35678,
  equity: 0.1,
  company_handle: "UCSF",
}

const UCSF = {
  handle: "UCSF",
  name: "University of California San Francisco",
  num_employees: 2000,
  description: "hospital stuff",
  logo_url: "lolgetoutofhere"
}


beforeEach(async function () {

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
    ])


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

})


afterEach(async function () {

  await db.query(`TRUNCATE TABLE jobs, companies`)
})

afterAll(async function () {
    await db.end()
})


// create a new job
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
    expect(response.body.job.title).toEqual("Singer")
    expect(response.body.job.salary).toEqual(12345)
    expect(response.body.job.equity).toEqual(0.66);
    expect(response.body.job.company_handle).toEqual("UCSF")

  })

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
})

// Read routes: get jobs  
describe("READ: GET /jobs", function () {

  // Lists all jobs if no query strings are passed
  test("Gets a list of all jobs", async function () {
    const response = await request(app).get(`/jobs`);
    expect(response.statusCode).toBe(200);
    expect(response.body.jobs).toHaveLength(1);
  })

  // Test the gets with query parameters
  test("Gets a list of all companies that match the title", async function () {
    const response = await request(app).get(`/jobs?title=JrSpecialist`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ "jobs": [{ "company_handle" : "UCSF", "title" : "JrSpecialist" }]})
  })

  test("Return error 400 if max_salary is less than min salary", async function () {
    const response = await request(app).get(`/jobs?title=JrSpecialistd&min_salary=3000&max_salary=200`);
    // expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({ "message": "Please give a valid range", "status": 400 })
  })

  test("Return specific company based on valid query params", async function () {
    const response = await request(app).get(`/jobs?min_salary=3000&max_salary=45000`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ "jobs": [{ "company_handle" : "UCSF", "title" : "JrSpecialist" }]})
  })

  test("Return nothing if no jobs satisfy valid query params", async function () {
    const response = await request(app).get(`/jobs?min_salary=999999`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ "jobs": []})
  })
})

// Update : 
describe("PATCH /jobs/:id", function () {
  test("Successfully updates a single job posting by id", async function () {

    const result = await db.query(`SELECT * from jobs`);
    console.log("ROWS", result.rows[0]);
      const response = await request(app)
          .patch(`/jobs/1`)
          .send({
            title: "JrSpecialistII",
            salary: 40000,
            equity: 0.2,
            company_handle: "UCSF",
          })

      expect(response.statusCode).toBe(200);

      expect(response.body).toEqual({
      })
  })

  // invalid handle
  test("Responds with 404 if id invalid", async function () {
      const response = await request(app).patch(`/jobs/asdlkfjlasdjf`)

      expect(response.statusCode).toBe(404)
      expect(response.body.message).toEqual("Job not found!")
  });
});