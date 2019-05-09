process.env.NODE_ENV = "test"

const request = require("supertest")
const app = require("../../app")

let db = require("../../db")

let companyOne = {
    "handle": "AROUND",
    "name": "getAround",
    "num_employees": 2000,
    "description": "Where Jax used to work",
    "logo_url": "lolgetoutofhere"
}


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
                );`)

    await db.query(`INSERT INTO companies (
                handle,
                name,
                num_employees,
                description,
                logo_url)
                VALUES ($1, $2, $3, $4, $5)`, [
            companyOne.handle,
            companyOne.name,
            companyOne.num_employees,
            companyOne.description,
            companyOne.logo_url
        ])
}
)


afterEach(async function () {
    await db.query(`DROP TABLE IF EXISTS companies, jobs`)
})

afterAll(async function () {
    await db.end();
})


// CRUD - Read route 
describe("GET /companies", function () {


    test("Gets a list of all companies", async function () {
        const response = await request(app).get(`/companies`);
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ "companies": [{ "description": "Where Jax used to work", "handle": "AROUND", "logo_url": "lolgetoutofhere", "name": "getAround", "num_employees": 2000 }] })
    })
    // Test the gets with query parameters

    test("Get a list of all companies with the search keyword", async function () {
        const response = await request(app).get(`/companies?search=getAround`);
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ "company": [{ "handle": "AROUND", "name": "getAround" }] })
    })

    test("Return 404 for invalid query params", async function () {
        const response = await request(app).get(`/companies?search=getAround&min_employees=3000&max_employees=200`);
        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({ "message": "Please give a valid range", "status": 400 })
    })

    test("Return specific company based on valid query params", async function () {
        const response = await request(app).get(`/companies?min_employees=300&max_employees=2001`);
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ "company": [{ "handle": "AROUND", "name": "getAround" }] })
    })

    test("Return nothing if no companies satisfy valid query params", async function () {
        const response = await request(app).get(`/companies?min_employees=300&max_employees=2000`);
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ "company": [] })
    })
})

// create
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
    })


    // Make another bogus company
    let companyTwo = {
        "handle": "GGLY",
        "name": "Goooooogly",
        "num_employees": 1234,
        "description": "Where Jax will work",
        "logo_url": "www.lolgetoutofhere.com"
    }

    test("Route makes a company", async function () {
        const response = await request(app).post(`/companies`)
            .send(companyTwo);
        expect(response.statusCode).toBe(200)
        expect(response.body).toEqual({
            "handle": "GGLY",
            "name": "Goooooogly",
            "num_employees": 1234,
            "description": "Where Jax will work",
            "logo_url": "www.lolgetoutofhere.com"
        })
    })
})

// UPDATE 
describe("PATCH /companies/:handle", function () {
    test("Updates a single company", async function () {
        const response = await request(app)
            .patch(`/companies/AROUND`)
            .send({
                "handle": "GGLY",
                "name": "Gooooo===ogly",
                "num_employees": 1234,
                "description": "Where Jax will work",
                "logo_url": "www.lolgetoutofhere.com"
            })

        expect(response.statusCode).toBe(200);

        expect(response.body).toEqual({
            "company": {
                "description": "Where Jax will work",
                "handle": "GGLY",
                "logo_url": "www.lolgetoutofhere.com",
                "name": "Gooooo===ogly",
                "num_employees": 1234,
            },
        })
    })

    // invalid handle
    test("Responds with 404 if id invalid", async function () {
        const response = await request(app).patch(`/companies/asdlkfjlasdjf`)

        expect(response.statusCode).toBe(404)
        expect(response.body.message).toEqual("Company not found!")
    });
});


// DELETE 
describe("DELETE /companies/:handle", function () {
    test("Deletes a single a company", async function () {
        const response = await request(app)
            .delete(`/companies/AROUND`)
        expect(response.statusCode).toBe(200)
        expect(response.body).toEqual({ message: "Company deleted" })
    });
});
