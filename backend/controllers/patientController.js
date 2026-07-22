const patientModel = require("../models/patientModel")

// 1. API lấy danh sách tất cả bệnh nhân
async function index(req, res) {
    try {
        const patients = await patientModel.getAllPatients()
        res.json({
            success: true,
            patients
        })
    } catch (error) {
        console.error("Lỗi khi lấy danh sách bệnh nhân:", error)
        res.status(500).json({
            success: false,
            message: "Lỗi hệ thống khi lấy danh sách bệnh nhân."
        })
    }
}

// 2. API lấy chi tiết 1 bệnh nhân theo ID
async function show(req, res) {
    try {
        const id = req.params.id
        const patient = await patientModel.getPatientById(id)
        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy thông tin bệnh nhân."
            })
        }
        res.json({
            success: true,
            patient
        })
    } catch (error) {
        console.error("Lỗi khi xem chi tiết bệnh nhân:", error)
        res.status(500).json({
            success: false,
            message: "Lỗi hệ thống khi xem bệnh nhân."
        })
    }
}

// 3. API thêm bệnh nhân mới
async function store(req, res) {
    try {
        const { fullname, phone, email, dob, gender, address } = req.body

        if (!fullname || !phone || !dob) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng nhập các thông tin bắt buộc: Họ tên, Số điện thoại, Ngày sinh."
            })
        }

        const patientId = await patientModel.createPatient(fullname, phone, email, dob, gender, address)
        res.status(201).json({
            success: true,
            message: "Thêm bệnh nhân thành công.",
            patientId
        })
    } catch (error) {
        console.error("Lỗi khi thêm bệnh nhân:", error)
        res.status(500).json({
            success: false,
            message: "Lỗi hệ thống khi thêm bệnh nhân."
        })
    }
}

// 4. API xóa bệnh nhân
async function destroy(req, res) {
    try {
        const id = req.params.id
        await patientModel.deletePatient(id)
        res.json({
            success: true,
            message: "Xóa bệnh nhân thành công."
        })
    } catch (error) {
        console.error("Lỗi khi xóa bệnh nhân:", error)
        res.status(500).json({
            success: false,
            message: "Lỗi hệ thống khi xóa bệnh nhân."
        })
    }
}

module.exports = {
    index,
    show,
    store,
    destroy
}
