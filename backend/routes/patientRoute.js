const express = require("express")
const router = express.Router()
const patientController = require("../controllers/patientController")
const { requireLogin } = require("../middlewares/authMiddleware")

// Đăng ký các endpoints cho Quản lý Bệnh nhân
router.get("/", requireLogin, patientController.index)
router.get("/:id", requireLogin, patientController.show)
router.post("/", requireLogin, patientController.store)
router.put("/:id", requireLogin, patientController.update)
router.delete("/:id", requireLogin, patientController.destroy)

module.exports = router
