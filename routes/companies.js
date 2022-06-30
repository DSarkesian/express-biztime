const express = require("express");
const db = require("../db");
const { NotFoundError, BadRequestError } = require("../expressError");
const companiesRouter = new express.Router();

companiesRouter.get("/", async function (req,res){
  const results = await db.query("SELECT code, name FROM companies");
  const companies = results.rows;
  console.log("is the route working?")

  return res.json({companies})
})

companiesRouter.get("/:code",
  async function (req, res) {
    const code = req.params.code;

    const results = await db.query(
      `SELECT code, name, description
                FROM companies
                WHERE code = $1`, [code]);
    const company = results.rows[0];
    console.log("company=", company)

    if (!company) throw new NotFoundError(`No matching company: ${code}`);
    return res.json({ company: company });
});

companiesRouter.delete("/:id", async function (req, res, next) {
  const id = req.params.id;
  const results = await db.query(
    "DELETE FROM cats WHERE id = $1 RETURNING id", [id]);
  const cat = results.rows[0];

  if (!cat) throw new NotFoundError(`No matching cat: ${id}`);
  return res.json({ message: "Cat deleted" });
});

module.exports = companiesRouter;
