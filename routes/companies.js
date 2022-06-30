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
    const type = req.query.type;

    const results = await db.query(
      `SELECT code, name, description
               FROM companies
               WHERE type = $1`, [type]);
    const company = results.rows;
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
