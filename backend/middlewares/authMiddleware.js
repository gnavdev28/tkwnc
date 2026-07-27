// Middleware kiểm tra đăng nhập (chặn nếu chưa có phiên làm việc)
function requireLogin(req, res, next) {
    if (!req.session || !req.session.user) {
        return res.status(401).json({
            success: false,
            message: "Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục."
        })
    }
    next() // Hợp lệ thì đi tiếp vào API chính
}

module.exports = {
    requireLogin
}
