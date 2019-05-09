process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../../app");
let db = require("../../db");

const { createAllTables, dropAllTables, insertIntoCompanies, insertIntoJobs, insertIntoUsers } = require("../../helpers/testHelpers");

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

    let response = await request(app).post("/users")
      .send({
        username: "asdf",
        password: "noob",
        first_name: "Noobie",
        last_name: "Saurus",
        email: "asd@noobland.com",
        photo_url: "noob.com",
        is_admin: false
      });

    expect(typeof response.body.token).toEqual("string");

    // Check if all the other keys that aren't a token are the same
    let userObjNoToken = { ...response.body };
    delete userObjNoToken["token"];

    expect(userObjNoToken).toEqual({
      "user": {
        "email": "asd@noobland.com",
        "firstname": "Noobie",
        "lastname": "Saurus",
        "username": "asdf",
      },
    });

  });

  test("POST /users - no duplicate ", async function () {

    // let response = await request(app).post("/users")
    //   .send(NOOBUSER);

    // expect(response.body).toEqual({});
  });

}); // end describe
