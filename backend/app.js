require("dotenv").config()
const express = require("express")
const path = require("path")
const session = require("express-session")
const cors = require("cors")

const db = require("./config/db")
const authRoutes = require("./routes/authRoute")
const patientRoutes = require("./routes/patientRoute")
const treatmentRoutes = require("./routes/treatmentRoute")

const app = express()
const port = process.env.PORT || 3000

// Cấu hình CORS
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))

// Parser JSON & URLencoded với giới hạn dung lượng nhận ảnh Base64 chữ ký lớn hơn (5mb)
app.use(express.json({ limit: "5mb" }))
app.use(express.urlencoded({ extended: true, limit: "5mb" }))

// Phục vụ các file tĩnh công khai và file ảnh chữ ký trong thư mục uploads
app.use(express.static(path.join(__dirname, "public")))
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// Cấu hình Express Session
app.use(session({
    secret: process.env.SESSION_SECRET || "nhakhoasecretkey_2026",
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24
    }
}))

// Request Logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`)
    next()
})

// Đăng ký API routes
app.use("/api/auth", authRoutes)
app.use("/api/patients", patientRoutes)
app.use("/api/treatments", treatmentRoutes)

app.get("/", (req, res) => {
    res.send("Hệ thống REST API Quản lý nha khoa đang hoạt động.")
})

app.listen(port, () => {
    console.log(`Server dang chay tai http://localhost:${port}`)
})
