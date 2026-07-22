const db = require("../config/db")

// 1. Lấy danh sách bệnh án của 1 bệnh nhân (Kèm theo thông tin chi tiết răng và bác sĩ khám)
async function getTreatmentsByPatientId(patientId) {
    const [treatments] = await db.query(
        `SELECT t.*, u.fullname AS doctor_name 
         FROM treatments t 
         JOIN users u ON t.doctor_id = u.id 
         WHERE t.patient_id = ? 
         ORDER BY t.id DESC`,
        [patientId]
    )

    // Lấy chi tiết răng cho từng ca điều trị
    for (let t of treatments) {
        const [details] = await db.query(
            "SELECT * FROM treatment_details WHERE treatment_id = ?",
            [t.id]
        )
        t.teeth = details
    }

    return treatments
}

// 2. Tạo ca điều trị mới
async function createTreatment(patient_id, doctor_id, treatment_date, total_cost, signature_path, notes) {
    const [result] = await db.query(
        "INSERT INTO treatments (patient_id, doctor_id, treatment_date, total_cost, signature_path, notes) VALUES (?, ?, ?, ?, ?, ?)",
        [patient_id, doctor_id, treatment_date, total_cost, signature_path, notes]
    )
    return result.insertId
}

// 3. Thêm chi tiết tình trạng răng vào ca điều trị
async function addTreatmentDetail(treatment_id, tooth_number, condition, notes) {
    await db.query(
        "INSERT INTO treatment_details (treatment_id, tooth_number, `condition`, notes) VALUES (?, ?, ?, ?)",
        [treatment_id, tooth_number, condition, notes]
    )
}

module.exports = {
    getTreatmentsByPatientId,
    createTreatment,
    addTreatmentDetail
}
