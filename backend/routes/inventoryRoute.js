const express = require("express")
const router = express.Router()
const inventoryController = require("../controllers/inventoryController")
const { requireLogin } = require("../middlewares/authMiddleware")

// Các API quản lý kho vật tư (chỉ yêu cầu đăng nhập)
router.get("/", requireLogin, inventoryController.index)
router.post("/", requireLogin, inventoryController.store)
router.put("/:id", requireLogin, inventoryController.update)

module.exports = router
