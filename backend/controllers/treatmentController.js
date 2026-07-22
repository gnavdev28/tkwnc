const treatmentModel = require("../models/treatmentModel")
const fs = require("fs")
const path = require("path")

// 1. API lấy danh sách ca điều trị của 1 bệnh nhân
async function getByPatient(req, res) {
    try {
        const patientId = req.params.patientId
        const treatments = await treatmentModel.getTreatmentsByPatientId(patientId)
        res.json({
            success: true,
            treatments
        })
    } catch (error) {
        console.error("Lỗi lấy danh sách bệnh án:", error)
        res.status(500).json({
            success: false,
            message: "Lỗi hệ thống khi lấy thông tin bệnh án."
        })
    }
}

// 2. API tạo bệnh án mới (Tự động lưu ảnh chữ ký từ Canvas và lưu tình trạng răng)
async function store(req, res) {
    try {
        const { patient_id, treatment_date, total_cost, notes, tooth_number, condition, signatureBase64 } = req.body
        const doctor_id = req.session.user.id

        if (!patient_id || !treatment_date || !tooth_number) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng chọn bệnh nhân, ngày khám và số hiệu răng."
            })
        }

        let signature_path = null

        // Xử lý lưu chuỗi Base64 từ Canvas ký tên thành file ảnh PNG trên Server
        if (signatureBase64 && signatureBase64.includes("base64,")) {
            const base64Data = signatureBase64.split("base64,")[1]
            const filename = `signature_${Date.now()}.png`
            const uploadDir = path.join(__dirname, "../uploads")
            
            // Tạo thư mục uploads nếu chưa có
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true })
            }

            const filePath = path.join(uploadDir, filename)
            fs.writeFileSync(filePath, base64Data, "base64")
            signature_path = `/uploads/${filename}`
        }

        // 1. Lưu thông tin ca điều trị chính
        const treatmentId = await treatmentModel.createTreatment(
            patient_id,
            doctor_id,
            treatment_date,
            total_cost || 0,
            signature_path,
            notes
        )

        // 2. Lưu chi tiết số hiệu răng và tình trạng điều trị
        await treatmentModel.addTreatmentDetail(
            treatmentId,
            tooth_number,
            condition || "healthy",
            notes
        )

        res.status(201).json({
            success: true,
            message: "Tạo bệnh án và lưu chữ ký thành công.",
            treatmentId
        })
    } catch (error) {
        console.error("Lỗi khi tạo bệnh án:", error)
        res.status(500).json({
            success: false,
            message: "Lỗi hệ thống khi tạo bệnh án."
        })
    }
}

module.exports = {
    getByPatient,
    store
}
