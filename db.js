const mysql = require('mysql2');

const host = process.env.DB_HOST;
const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const database = process.env.DB_NAME;
const port = process.env.DB_PORT; // tambahkan variabel port

// Buat koneksi
const db = mysql.createConnection({
  host,
  user,
  password,
  database,
  port // tambahkan properti port
});

// Terhubung ke database
db.connect((err) => {
  if(err) {
    console.log(err);;
  }
  console.log('MySQL terhubung...');
});

module.exports = db;
