process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../../app");
let db = require("../../db");

const { createAllTables, insertIntoCompanies } = require("../../helpers/testHelpers");


beforeEach( async function() {
  await createAllTables();
  
});

