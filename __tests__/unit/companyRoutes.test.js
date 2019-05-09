process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../../app");

let db = require("../../db");
const { createAllTables, dropAllTables } = require("../../helpers/testHelpers");
const { insertIntoUsers, insertIntoCompanies } = require("../../helpers/testHelpers");

const { ADMIN, NOOBUSER } = require("../../helpers/testHelpers");

// Grab a sample testing company, the AROUND COMPANY
const { AROUNDCOMPANY } = require("../../helpers/testHelpers");

beforeEach(async function () {
  await dropAllTables();
  await createAllTables();
  await insertIntoCompanies(AROUNDCOMPANY);
  await request(app).post('/users').send(ADMIN);

  // Make that admin an admin
  db.query(`UPDATE users
  SET is_admin = true
  WHERE username=$1;`, [ADMIN.username]);

  await request(app).post('/users').send(NOOBUSER);

});

afterEach(async function () {
  await dropAllTables();
});

afterAll(async function () {
  await db.end();
});

// Read route for companies 
describe("GET /companies", function () {


  test("Can't get a list of all companies if you ain't logged in", async function () {

    const response = await request(app).get(`/companies`);

    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty("message");
  });

  test("Gets a list of all companies if you are logged in eitehr as admin", async function () {

    // First register the Admin and login as the admin
    
    const loginResponse = await request(app).post('/login').send(ADMIN);
    const { token } = loginResponse.body;

    const response = await request(app).get(`/companies`).send({ "_token": token });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("companies");

  });


  test("Gets a list of all companies if you are logged in as a regular user", async function () {

    await request(app).post('/users').send(NOOBUSER);
    const loginResponse = await request(app).post('/login').send(NOOBUSER);
    const { token } = loginResponse.body;

    const response = await request(app).get(`/companies`).send({ "_token": token });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("companies");

  });

});


describe("POST /companies", function () {

  test("Route returns 404 if invalid sending", async function () {
    const response = await request(app).post(`/companies`)
      .send({ "lksadjflkasd": "dklsafjs", "jflksadjf": "bogus" });
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      "message": [
        "instance requires property \"handle\"",
        "instance requires property \"name\"",
        "instance requires property \"num_employees\"",
        "instance requires property \"description\"",
        "instance requires property \"logo_url\"",
      ],
      "status": 400,
    });
  });


  // Make another bogus company
  let companyTwo = {
    "handle": "GGLY",
    "name": "Goooooogly",
    "num_employees": 1234,
    "description": "Where Jax will work",
    "logo_url": "www.lolgetoutofhere.com"
  };

  test("Route makes a company", async function () {
        
    const loginResponse = await request(app).post('/login').send(ADMIN);
    const { token } = loginResponse.body;

    const response = await request(app).post(`/companies`)
      .send({...companyTwo, "_token" : token});
    expect(response.statusCode).toBe(200);
    expect(response.body).toBeInstanceOf(Object);
  });
});

//  UPDATE 
describe("PATCH /companies/:handle", function () {
  test("Updates a single company if they are admin", async function () {

    const loginResponse = await request(app).post('/login').send(ADMIN);
    const { token } = loginResponse.body;

    const response = await request(app)
      .patch(`/companies/AROUND`)
      .send({
        "handle": "GGLY",
        "name": "Gooooo===ogly",
        "num_employees": 1234,
        "description": "Where Jax will work",
        "logo_url": "www.lolgetoutofhere.com",
        "_token": token
      });

    expect(response.statusCode).toBe(200);

    expect(response.body).toBeInstanceOf(Object);
  });

});


//   // invalid handle
//   test("Responds with 404 if id invalid", async function () {
//     const response = await request(app).patch(`/companies/asdlkfjlasdjf`);

//     expect(response.statusCode).toBe(404);
//     expect(response.body.message).toEqual("Company not found!");
//   });
// });


// // DELETE 
// describe("DELETE /companies/:handle", function () {
//   test("Deletes a single a company", async function () {
//     const response = await request(app)
//       .delete(`/companies/AROUND`);

//     expect(response.statusCode).toBe(200);
//     expect(response.body).toEqual({ message: "Company deleted" });
//   });
// });
