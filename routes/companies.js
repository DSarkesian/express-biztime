"use strict";
const express = require("express");
const db = require("../db");

const { NotFoundError, BadRequestError } = require("../expressError");
const companiesRouter = new express.Router();



/** GET/ - returns `{company:[{code,name},...]} */

companiesRouter.get("/", async function (req, res) {
  const results = await db.query("SELECT code, name FROM companies");
  const companies = results.rows;
  console.log("is the route working?");

  return res.json({ companies });
});

/** GET/[code] - return data about one company and its invoices
 * {company: {code, name, description, invoices: [id, ...]}} */
companiesRouter.get("/:code", async function (req, res) {
  const code = req.params.code;
  const cResults = await db.query(
    `SELECT code, name, description
                FROM companies
                WHERE code = $1`, [code]);
  const company = cResults.rows[0];

  const results = await db.query(
    `SELECT id, comp_code, amt, paid, add_date, paid_date
                FROM invoices
                WHERE comp_code = $1`, [code]);
  company.invoices = results.rows.map(i => i);
  if (!company) throw new NotFoundError(`No matching company: ${code}`);

  return res.json({ company });
});

/** POST/ - create company from data; -
 * return {company:{code, name, description}}  */

companiesRouter.post("/", async function (req, res) {
  const { code, name, description } = req.body;
  const results = await db.query(
    `INSERT INTO companies (code,name,description)
         VALUES ($1,$2,$3)
         RETURNING code, name,description`,
    [code, name, description]);
  const company = results.rows[0];

  return res.status(201).json({ company: company });
});
/** PUT/[code] -updates company name, description returns
 * {company:{code, name, description}  */

companiesRouter.put("/:code", async function (req, res) {
  if ("code" in req.body) throw new BadRequestError("Not allowed");

  const code = req.params.code;

  const results = await db.query(
    `UPDATE companies
         SET name=$1,
         description =$3
         WHERE code = $2
         RETURNING code, name,description`,
    [req.body.name, code, req.body.description]);
  const company = results.rows[0];

  if (!company) throw new NotFoundError(`No matching code: ${id}`);
  return res.json({ company: company });
});


/** DELETE/[code] - deletes company from database
 * -returns { status: "code deleted" }   */

companiesRouter.delete("/:code", async function (req, res) {
  const code = req.params.code;
  const results = await db.query(
    "DELETE FROM companies WHERE code = $1 RETURNING code", [code]);
  const company = results.rows[0];

  if (!company) throw new NotFoundError(`No matching code: ${code}`);
  return res.json({ status: "code deleted" });
});



module.exports = companiesRouter;
