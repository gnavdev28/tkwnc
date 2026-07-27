const billingModel = require("../models/billingModel")
const ExcelJS = require("exceljs")

// Lấy danh sách doanh thu hóa đơn và nợ trả góp
async function index(req, res) {
    try {
        const billings = await billingModel.getAllBillings()
        res.json({
            success: true,
            billings
        })
    } catch (error) {
        console.error("Lỗi lấy danh sách tài chính:", error)
        res.status(500).json({
            success: false,
            message: "Lỗi hệ thống khi lấy danh sách tài chính."
        })
    }
}

// Lấy lịch sử các đợt đóng tiền trả góp của một ca khám
async function getPayments(req, res) {
    try {
        const treatmentId = req.params.treatmentId
        const payments = await billingModel.getPaymentsByTreatmentId(treatmentId)
        res.json({
            success: true,
            payments
        })
    } catch (error) {
        console.error("Lỗi lấy danh sách thanh toán:", error)
        res.status(500).json({
            success: false,
            message: "Lỗi hệ thống khi lấy lịch sử đóng tiền."
        })
    }
}

// Thực hiện thu tiền đóng trả góp đợt mới
async function pay(req, res) {
    try {
        const { treatment_id, amount_paid, notes } = req.body

        if (!treatment_id || !amount_paid || amount_paid <= 0) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng nhập số tiền đóng hợp lệ."
            })
        }

        // Lưu lượt đóng tiền vào bảng payments (SQL Trigger sẽ tự động cập nhật tổng tiền đã trả)
        await billingModel.createPayment(treatment_id, amount_paid, notes || "")
        res.json({
            success: true,
            message: "Đóng tiền thành công."
        })
    } catch (error) {
        console.error("Lỗi thực hiện đóng tiền:", error)
        res.status(500).json({
            success: false,
            message: "Lỗi hệ thống khi đóng tiền."
        })
    }
}

// Xuất danh sách doanh thu ra tệp Excel gửi trực tiếp về trình duyệt tải xuống
async function exportExcel(req, res) {
    try {
        const billings = await billingModel.getAllBillings()

        // Khởi tạo workbook Excel mới trong RAM
        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet("Doanh Thu Nha Khoa")

        // Cài đặt tên và kích cỡ cho các cột Excel
        worksheet.columns = [
            { header: "Mã ca", key: "id", width: 10 },
            { header: "Tên Bệnh Nhân", key: "patient_name", width: 25 },
            { header: "Bác Sĩ Điều Trị", key: "doctor_name", width: 25 },
            { header: "Ngày Khám", key: "treatment_date", width: 15 },
            { header: "Tổng Chi Phí (VNĐ)", key: "total_cost", width: 20 },
            { header: "Đã Thanh Toán (VNĐ)", key: "total_paid", width: 20 },
            { header: "Còn Nợ (VNĐ)", key: "remaining", width: 20 }
        ]

        // Thêm dữ liệu từng dòng vào sheet Excel
        billings.forEach(b => {
            worksheet.addRow({
                id: b.id,
                patient_name: b.patient_name,
                doctor_name: b.doctor_name,
                treatment_date: new Date(b.treatment_date).toLocaleDateString("vi-VN"),
                total_cost: Number(b.total_cost),
                total_paid: Number(b.total_paid),
                remaining: Number(b.remaining)
            })
        })

        // Cấu hình Header phản hồi HTTP tải file đính kèm
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
        res.setHeader("Content-Disposition", "attachment; filename=bao_cao_doanh_thu.xlsx")

        // Ghi luồng dữ liệu trực tiếp vào luồng phản hồi HTTP
        await workbook.xlsx.write(res)
        res.end()
    } catch (error) {
        console.error("Lỗi xuất Excel:", error)
        res.status(500).json({
            success: false,
            message: "Lỗi hệ thống khi xuất file Excel."
        })
    }
}

module.exports = {
    index,
    getPayments,
    pay,
    exportExcel
}
