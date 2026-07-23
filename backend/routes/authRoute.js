const express = require("express")
const router = express.Router()
const authController = require("../controllers/authController")
const { requireLogin, requireRoles } = require("../middlewares/authMiddleware")

// Các API công khai cho đăng nhập/đăng xuất
router.post("/login", authController.login)
router.post("/logout", authController.logout)
router.post("/2fa/verify", authController.verify2FA)

// API lấy thông tin phiên làm việc hiện tại của Client
router.get("/me", authController.getMe)

// API quản lý thiết lập 2FA (yêu cầu đã đăng nhập)
router.post("/2fa/setup", requireLogin, authController.setup2FA)
router.post("/2fa/enable", requireLogin, authController.enable2FA)
router.post("/2fa/disable", requireLogin, authController.disable2FA)

// API đăng ký nhân viên mới (Chỉ Admin mới có quyền truy cập)
router.post("/register", requireLogin, requireRoles(["admin"]), authController.register)

module.exports = router
