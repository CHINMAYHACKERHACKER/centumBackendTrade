const mysql = require("mysql");
require('dotenv').config()


const URLDB=`mysql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.PORT}/${process.env.DB_DATABASE}`
const con = mysql.createConnection(URLDB);

con.connect((ERR) => {
    if (ERR) {
        console.log("ERROR CONNECTING DATABASE");
    }
    else {
        console.log("DATABASE CONNECTED");

    }
})

module.exports = con;