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

module.exports = invoicesRouter;

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