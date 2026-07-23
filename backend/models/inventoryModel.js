const db = require("../config/db")

// 1. Lấy danh sách toàn bộ vật tư y tế trong kho
async function getAllMaterials() {
    const [rows] = await db.query(
        "SELECT * FROM materials ORDER BY id DESC"
    )
    return rows
}

// 2. Lấy thông tin 1 vật tư theo ID
async function getMaterialById(id) {
    const [rows] = await db.query(
        "SELECT * FROM materials WHERE id = ?",
        [id]
    )
    return rows[0] || null
}

// 3. Cập nhật thông tin và số lượng vật tư kho trực tiếp (Nhập thêm kho)
async function updateMaterial(id, name, unit, quantity, min_quantity) {
    await db.query(
        "UPDATE materials SET name = ?, unit = ?, quantity = ?, min_quantity = ? WHERE id = ?",
        [name, unit, quantity, min_quantity, id]
    )
}

// 4. Trừ số lượng tồn kho của vật tư khi sử dụng trong ca điều trị
async function deductMaterialQuantity(materialId, quantityUsed) {
    await db.query(
        "UPDATE materials SET quantity = quantity - ? WHERE id = ?",
        [quantityUsed, materialId]
    )
}

// 5. Ghi nhận vật tư đã dùng vào bảng chi tiết ca điều trị (treatment_materials)
async function logTreatmentMaterial(treatmentId, materialId, quantityUsed) {
    await db.query(
        "INSERT INTO treatment_materials (treatment_id, material_id, quantity_used) VALUES (?, ?, ?)",
        [treatmentId, materialId, quantityUsed]
    )
}

async function createMaterial(name, unit, quantity, min_quantity) {
    const [result] = await db.query(
        "INSERT INTO materials (name, unit, quantity, min_quantity) VALUES (?, ?, ?, ?)",
        [name, unit, quantity, min_quantity]
    )
    return result.insertId
}

module.exports = {
    getAllMaterials,
    getMaterialById,
    updateMaterial,
    deductMaterialQuantity,
    logTreatmentMaterial,
    createMaterial
}
