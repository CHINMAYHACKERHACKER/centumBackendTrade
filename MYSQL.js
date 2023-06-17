const mysql = require("mysql");
require('dotenv').config()

const URLDB=`mysql://${process.env.MYSQLUSER}:${process.env.MYSQLPASSWORD}@${process.env.MYSQLHOST}:${process.env.MYSQLPORT}/${process.env.MYSQLDATABASE}`
const con = mysql.createConnection(URLDB)

con.connect((ERR) => {
    if (ERR) {
        console.log("ERROR CONNECTING DATABASE");
    }
    else {
        console.log("DATABASE CONNECTED");

    }
})

module.exports = con;