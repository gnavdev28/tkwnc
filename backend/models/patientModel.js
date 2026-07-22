const db = require("../config/db")

// 1. Lấy danh sách tất cả bệnh nhân (Mới nhất lên đầu)
async function getAllPatients() {
    const [rows] = await db.query(
        "SELECT * FROM patients ORDER BY id DESC"
    )
    return rows
}

// 2. Lấy thông tin 1 bệnh nhân theo ID
async function getPatientById(id) {
    const [rows] = await db.query(
        "SELECT * FROM patients WHERE id = ?",
        [id]
    )
    return rows[0] || null
}

// 3. Thêm bệnh nhân mới vào database
async function createPatient(fullname, phone, email, dob, gender, address) {
    const [result] = await db.query(
        "INSERT INTO patients (fullname, phone, email, dob, gender, address) VALUES (?, ?, ?, ?, ?, ?)",
        [fullname, phone, email, dob, gender, address]
    )
    return result.insertId
}

// 4. Xóa bệnh nhân theo ID
async function deletePatient(id) {
    await db.query(
        "DELETE FROM patients WHERE id = ?",
        [id]
    )
}

module.exports = {
    getAllPatients,
    getPatientById,
    createPatient,
    deletePatient
}
