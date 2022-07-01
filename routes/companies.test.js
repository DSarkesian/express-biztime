const request = require("supertest");

// app imports
const app = require("../app");
const db = require("../db");

let testCompanies;

beforeEach(async function() {
    await db.query("DELETE FROM companies");
    let result = await db.query(`
    INSERT INTO companies (code, name, description)
    VALUES ('tcomp', 'TestCompany', "Test description")
    RETURNING code, name, description`);
    testCompanies = result.rows[0];
});

describe("GET/companies/", function() {
    testCompanies("Gets list of companies", async function() {
        const resp = await request(app).get(`/companies/`);
        expect(resp.body).toEqual({ company: [{testCompanies}]});
    })
});

describe("GET/companies/[code]", function(){
    testCompanies("gets single company", async function() {
        const resp = await request(app).get(`/companies/tcomp`);
        expect(resp.body).toEqual({company:testCompanies})
    })
})

afterAll(async function () {
    // close db connection --- if you forget this, Jest will hang
    await db.end();
  });
