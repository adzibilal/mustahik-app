const mysql = require('mysql');

const host = process.env.DB_HOST;
const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const database = process.env.DB_NAME;


// Buat koneksi
const db = mysql.createConnection({
  host,
  user,
  password,
  database
});

// Terhubung ke database
db.connect((err) => {
  if(err) {
    throw err;
  }
  console.log('MySQL terhubung...');
});

module.exports = db;
