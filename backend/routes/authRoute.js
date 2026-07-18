const express = require("express")
const router = express.Router()
const authController = require("../controllers/authController")
const { requireLogin, requireRoles } = require("../middlewares/authMiddleware")

// Các API công khai cho đăng nhập/đăng xuất
router.post("/login", authController.login)
router.post("/logout", authController.logout)

// API lấy thông tin phiên làm việc hiện tại của Client
router.get("/me", authController.getMe)

// API đăng ký nhân viên mới (Chỉ Admin mới có quyền truy cập)
router.post("/register", requireLogin, requireRoles(["admin"]), authController.register)

module.exports = router
