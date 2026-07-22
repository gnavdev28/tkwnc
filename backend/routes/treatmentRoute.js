const express = require("express")
const router = express.Router()
const treatmentController = require("../controllers/treatmentController")
const { requireLogin } = require("../middlewares/authMiddleware")

// Các endpoint quản lý ca điều trị / bệnh án
router.get("/patient/:patientId", requireLogin, treatmentController.getByPatient)
router.post("/", requireLogin, treatmentController.store)

module.exports = router
