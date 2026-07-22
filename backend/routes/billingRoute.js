const express = require("express")
const router = express.Router()
const billingController = require("../controllers/billingController")
const { requireLogin } = require("../middlewares/authMiddleware")

// Các API tài chính, trả góp và xuất Excel
router.get("/", requireLogin, billingController.index)
router.get("/payments/:treatmentId", requireLogin, billingController.getPayments)
router.post("/pay", requireLogin, billingController.pay)
router.get("/export", requireLogin, billingController.exportExcel)

module.exports = router
