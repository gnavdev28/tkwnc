const treatmentModel = require("../models/treatmentModel")
const inventoryModel = require("../models/inventoryModel")
const fs = require("fs")
const path = require("path")

// Lấy danh sách bệnh án (ca khám) của một bệnh nhân
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

// Tạo bệnh án mới (lưu ảnh chữ ký Canvas dạng base64 và tự động trừ kho vật tư tiêu hao)
async function store(req, res) {
    try {
        const { patient_id, treatment_date, total_cost, notes, tooth_number, condition, signatureBase64, usedMaterials } = req.body
        const doctor_id = req.session.user.id

        if (!patient_id || !treatment_date || !tooth_number) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng chọn bệnh nhân, ngày khám và số hiệu răng."
            })
        }

        let signature_path = null

        // Xử lý lưu ảnh chữ ký từ dữ liệu Base64 truyền lên
        if (signatureBase64 && signatureBase64.includes("base64,")) {
            const base64Data = signatureBase64.split("base64,")[1]
            const filename = `signature_${Date.now()}.png`
            const uploadDir = path.join(__dirname, "../uploads")
            
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true })
            }

            const filePath = path.join(uploadDir, filename)
            fs.writeFileSync(filePath, base64Data, "base64")
            signature_path = `/uploads/${filename}`
        }

        // 1. Tạo bản ghi ca điều trị chính (lưu vào bảng treatments)
        const treatmentId = await treatmentModel.createTreatment(
            patient_id,
            doctor_id,
            treatment_date,
            total_cost || 0,
            signature_path,
            notes
        )

        // 2. Tạo bản ghi chi tiết tình trạng răng bệnh lý (lưu vào bảng treatment_details)
        await treatmentModel.addTreatmentDetail(
            treatmentId,
            tooth_number,
            condition || "healthy",
            notes
        )

        // 3. Tự động khấu hao vật tư y tế trong kho (lặp qua các thuốc/vật tư đã chọn dùng)
        if (usedMaterials && Array.isArray(usedMaterials)) {
            for (let item of usedMaterials) {
                if (item.material_id && item.quantity_used > 0) {
                    // Trừ bớt số lượng tồn trong kho vật tư
                    await inventoryModel.deductMaterialQuantity(item.material_id, item.quantity_used)
                    // Ghi nhận lịch sử dùng vật tư tương ứng với ca điều trị này
                    await inventoryModel.logTreatmentMaterial(treatmentId, item.material_id, item.quantity_used)
                }
            }
        }

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
