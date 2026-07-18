const userModel = require("../models/userModel")

// 1. Đăng ký nhân viên (Chỉ Admin mới có quyền gọi API này)
async function register(req, res) {
    try {
        const { username, password, fullname, role } = req.body

        // Kiểm tra xem đã điền đủ các thông tin bắt buộc chưa
        if (!username || !password || !fullname) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng nhập đầy đủ: username, password và fullname."
            })
        }

        // Kiểm tra tài khoản đã tồn tại trong database chưa
        const existingUser = await userModel.findUserByUsername(username)
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Tên đăng nhập này đã tồn tại."
            })
        }

        // Tạo tài khoản mới vào database
        await userModel.createUser(username, password, fullname, role)
        res.status(201).json({
            success: true,
            message: "Tạo tài khoản nhân viên thành công."
        })
    } catch (error) {
        console.error("Lỗi khi đăng ký:", error)
        res.status(500).json({
            success: false,
            message: "Lỗi hệ thống khi đăng ký."
        })
    }
}

// 2. Đăng nhập và tạo Session cho trình duyệt
async function login(req, res) {
    try {
        const { username, password } = req.body

        // Kiểm tra dữ liệu đầu vào
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng nhập đầy đủ tài khoản và mật khẩu."
            })
        }

        // Tìm kiếm user trong database
        const user = await userModel.findUserByUsername(username)
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Tài khoản hoặc mật khẩu không chính xác."
            })
        }

        // Kiểm tra mật khẩu có khớp với mật khẩu băm trong database không
        const isMatch = await userModel.verifyPassword(password, user.password)
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Tài khoản hoặc mật khẩu không chính xác."
            })
        }

        // Lưu thông tin user vào Session (Lưu trữ ở server và tạo Connect SID Cookie gửi về client)
        req.session.user = {
            id: user.id,
            username: user.username,
            fullname: user.fullname,
            role: user.role
        }

        res.json({
            success: true,
            user: req.session.user,
            message: "Đăng nhập thành công."
        })
    } catch (error) {
        console.error("Lỗi đăng nhập:", error)
        res.status(500).json({
            success: false,
            message: "Lỗi hệ thống khi đăng nhập."
        })
    }
}

// 3. API lấy thông tin người dùng đang đăng nhập (React gọi mỗi khi load lại trang)
async function getMe(req, res) {
    if (req.session && req.session.user) {
        return res.json({
            success: true,
            user: req.session.user
        })
    }
    res.status(401).json({
        success: false,
        message: "Chưa đăng nhập."
    })
}

// 4. Đăng xuất, hủy session và xóa cookie
function logout(req, res) {
    if (req.session) {
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Lỗi hệ thống khi đăng xuất."
                })
            }
            res.clearCookie("connect.sid") // Xóa cookie phiên làm việc trên trình duyệt
            res.json({
                success: true,
                message: "Đăng xuất thành công."
            })
        })
    } else {
        res.json({
            success: true,
            message: "Đã đăng xuất."
        })
    }
}

module.exports = {
    register,
    login,
    getMe,
    logout
}
