"use strict"
const express = require("express");
const db = require("../db");

const { NotFoundError, BadRequestError } = require("../expressError");
const invoicesRouter = new express.Router();

/** GET/ - returns all invoices `{invoices:[{id, comp_code},...]} */
invoicesRouter.get("/", async function (req, res) {
    const results = await db.query("SELECT id, comp_code FROM invoices");
    const invoices = results.rows;

    return res.json({ invoices });
  });



/** GET/[id] - return data about one invoice
 *
 * {invoice: {id, amt, paid, add_date, paid_date,
 *      company: {code, name, description}} */

 invoicesRouter.get("/:id", async function (req, res) {
    const id = req.params.id;

    const results = await db.query(
      `SELECT id, comp_code, amt, paid, add_date, paid_date
                  FROM invoices
                  WHERE id = $1`, [id]);
    const invoice = results.rows[0];

    if (!invoice) throw new NotFoundError(`No matching invoice: ${id}`);

    const cResults = await db.query(
        `SELECT code, name, description
                    FROM companies
                    WHERE code = $1`, [invoice.comp_code]);
    const company = cResults.rows[0];

    invoice.company = company;
    delete invoice.comp_code;

    return res.json({ invoice });
  });

  /** POST/ - create invoice from data; -
 * return {invoice: {id, comp_code, amt, paid, add_date, paid_date}}  */

 invoicesRouter.post("/", async function (req, res) {
    const { comp_code,amt } = req.body;
    const results = await db.query(
      `INSERT INTO invoices(comp_code, amt)
           VALUES ($1,$2)
           RETURNING id,comp_code, amt, paid, add_date, paid_date`,
      [comp_code, amt]);
    const invoice = results.rows[0];

    return res.status(201).json({ invoice});
  });

  /** PUT/[id] -updates invoices amt returns
 * {invoice: {id, comp_code, amt, paid, add_date, paid_date}}  */

invoicesRouter.put("/:id", async function (req, res) {
  if ("id" in req.body) throw new BadRequestError("Not allowed");

  const id = req.params.id;

  const results = await db.query(
    `UPDATE invoices
         SET amt=$1
         WHERE id = $2
         RETURNING id,comp_code, amt, paid, add_date, paid_date`,
    [req.body.amt,id]);
  const invoice = results.rows[0];

  if (!invoice) throw new NotFoundError(`No matching invoice: ${id}`);
  return res.json({ invoice });
});

/** DELETE/[id] - deletes invoice from database
 * -returns { status: "code deleted" }   */

 invoicesRouter.delete("/:id", async function (req, res) {
  const id = req.params.id;
  const results = await db.query(
    "DELETE FROM invoices WHERE id = $1 RETURNING id", [id]);
  const invoice = results.rows[0];

  if (!invoice) throw new NotFoundError(`No matching code: ${id}`);
  return res.json({ status: "deleted" });
});


module.exports = invoicesRouter;
