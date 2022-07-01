"use strict"
/** Database setup for BizTime. */
const { Client } = require("pg");

/** MAC */
const DB_URI = process.env.NODE_ENV === "test"
    ? "postgresql:///biztime_test"
    : "postgresql:///biztime";

/** Ham's PC */
// const DB_URI = process.env.NODE_ENV === "test"
//     ? "postgresql://hannahanela:foofoo@localhost/biztime_test"
//     : "postgresql://hannahanela:foofoo@localhost/biztime";

let db = new Client({
  connectionString: DB_URI
});

db.connect();

module.exports = db;
