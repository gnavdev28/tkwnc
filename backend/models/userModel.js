const db = require("../config/db")
const bcrypt = require("bcrypt")

// 1. Tìm kiếm người dùng bằng username (dùng khi đăng nhập)
async function findUserByUsername(username) {
    const [rows] = await db.query(
        "SELECT * FROM users WHERE username = ?",
        [username]
    )
    return rows[0] || null
}

// 2. Tạo người dùng mới (dùng khi Admin đăng ký tài khoản cho nhân viên/bác sĩ)
async function createUser(username, password, fullname, role = "staff") {
    // Băm mật khẩu bằng bcrypt (10 vòng) trước khi lưu vào database
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds)
    
    await db.query(
        "INSERT INTO users (username, password, fullname, role) VALUES (?, ?, ?, ?)",
        [username, hashedPassword, fullname, role]
    )
}

// 3. So sánh mật khẩu người dùng gõ vào với mật khẩu đã mã hóa trong database
async function verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword)
}

// 4. Cập nhật khóa bí mật và trạng thái bật/tắt 2FA của tài khoản
async function update2FASecret(userId, secret, enabled) {
    await db.query(
        "UPDATE users SET twofa_secret = ?, twofa_enabled = ? WHERE id = ?",
        [secret, enabled, userId]
    )
}

module.exports = {
    findUserByUsername,
    createUser,
    verifyPassword,
    update2FASecret
}
