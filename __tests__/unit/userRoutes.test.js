process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../../app");
let db = require("../../db");

const { createAllTables, dropAllTables, insertIntoCompanies, insertIntoJobs } = require("../../helpers/testHelpers");

const { UCSF, JRSPECIALIST, NOOBUSER, ADMIN } = require("../../helpers/testHelpers");


beforeEach(async function () {
  await dropAllTables();
  await createAllTables();
  await insertIntoCompanies(UCSF);
  await insertIntoJobs(JRSPECIALIST);
  await insertIntoUsers(NOOBUSER);
  await insertIntoUsers(ADMIN);
});


afterAll(async function () {
  await db.end();
});


describe("CREATE USERS", function () {

  test("POST /users - create a new user & return info on the newly created", async function () {

    let response = request.post("/users")
      .send({
        username: "noobuser",
        password: "noob",
        first_name: "Noobie",
        last_name: "Saurus",
        email: "Noobasaurus@noobland.com",
        photo_url: "noob.com",
        is_admin: false
      })
  })

  test("POST /users - no duplicate ", async function () {

    let response = request.post("/users")
      .send({
        username: "noobuser",
        password: "noob",
        first_name: "Noobie",
        last_name: "Saurus",
        email: "Noobasaurus@noobland.com",
        photo_url: "noob.com",
        is_admin: false
      })
  })
}
