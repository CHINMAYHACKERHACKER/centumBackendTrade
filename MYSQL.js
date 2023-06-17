const mysql = require("mysql");
require('dotenv').config()

const URLDB = `mysql://${process.env.MYSQLUSER}:${process.env.MYSQLPASSWORD}@${process.env.MYSQLHOST}:${process.env.MYSQLPORT}/${process.env.MYSQLDATABASE}`;

const con = mysql.createConnection({
    url: URLDB,
    connectTimeout: 10000, // 10 seconds
});

con.connect((err) => {
    if (err) {
        console.error("Error connecting to the database:", err);
    } else {
        console.log("Database connected successfully");
    }
});

module.exports = con;
