require("dotenv").config()
const express = require("express")
const path = require("path")
const session = require("express-session")
const cors = require("cors")

const db = require("./config/db")
const authRoutes = require("./routes/authRoute")

const app = express()
const port = process.env.PORT || 3000

// Cấu hình CORS đúng chuẩn bài Lab để cho phép frontend React (cổng 5173) gọi API và đính kèm cookie
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))

// Parser dữ liệu request
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, "public")))

// Cấu hình Express Session lưu cookie phiên làm việc
app.use(session({
    secret: process.env.SESSION_SECRET || "nhakhoasecretkey_2026",
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Chạy HTTP ở localhost thông thường
        httpOnly: true, // Bảo mật chống script độc hại đọc cookie
        maxAge: 1000 * 60 * 60 * 24 // Cookie sống trong 1 ngày
    }
}))

// Request Logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`)
    next()
})

// Định tuyến APIs
app.use("/api/auth", authRoutes)

app.get("/", (req, res) => {
    res.send("Hệ thống quản lý nha khoa backend REST API đang hoạt động.")
})

app.listen(port, () => {
    console.log(`Server dang chay tai http://localhost:${port}`)
})
