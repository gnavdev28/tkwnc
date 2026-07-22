const db = require("../config/db")

// 1. Lấy danh sách toàn bộ ca điều trị kèm thông tin tài chính (Họ tên bệnh nhân, chi phí, số tiền đã trả)
async function getAllBillings() {
    // Truy vấn tất cả ca điều trị kèm thông tin Bệnh nhân và Bác sĩ khám
    const [treatments] = await db.query(
        `SELECT t.*, p.fullname AS patient_name, u.fullname AS doctor_name 
         FROM treatments t 
         JOIN patients p ON t.patient_id = p.id 
         JOIN users u ON t.doctor_id = u.id 
         ORDER BY t.id DESC`
    )

    // Với mỗi ca điều trị, tính tổng số tiền đã thanh toán từ bảng payments
    for (let t of treatments) {
        const [payRows] = await db.query(
            "SELECT SUM(amount_paid) AS total_paid FROM payments WHERE treatment_id = ?",
            [t.id]
        )
        t.total_paid = payRows[0].total_paid || 0
        t.remaining = t.total_cost - t.total_paid
    }

    return treatments
}

// 2. Lấy danh sách các đợt đóng tiền của 1 ca điều trị
async function getPaymentsByTreatmentId(treatmentId) {
    const [rows] = await db.query(
        "SELECT * FROM payments WHERE treatment_id = ? ORDER BY id DESC",
        [treatmentId]
    )
    return rows
}

// 3. Thực hiện thanh toán: Ghi nhận đợt đóng tiền mới cho ca điều trị
async function createPayment(treatmentId, amountPaid, notes) {
    await db.query(
        "INSERT INTO payments (treatment_id, payment_date, amount_paid, notes) VALUES (?, NOW(), ?, ?)",
        [treatmentId, amountPaid, notes]
    )
}

module.exports = {
    getAllBillings,
    getPaymentsByTreatmentId,
    createPayment
}
