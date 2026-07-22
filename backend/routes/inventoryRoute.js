const express = require("express")
const router = express.Router()
const inventoryController = require("../controllers/inventoryController")
const { requireLogin, requireRoles } = require("../middlewares/authMiddleware")

// Các API quản lý kho vật tư
router.get("/", requireLogin, inventoryController.index)

// Chỉ có Admin hoặc Nhân viên trực quầy mới có quyền cập nhật nhập thêm kho vật tư
router.put("/:id", requireLogin, requireRoles(["admin", "staff"]), inventoryController.update)

module.exports = router
