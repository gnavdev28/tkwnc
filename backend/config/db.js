require("dotenv").config()
const mysql = require("mysql2/promise")

// Cấu hình kết nối MySQL Pool bám sát sườn bài Lab trên lớp
const db = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "nhakhoa_db"
})

module.exports = db
