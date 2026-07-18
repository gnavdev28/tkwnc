// 1. Middleware kiểm tra đăng nhập (nếu chưa có session thì trả về lỗi 401 cho React)
function requireLogin(req, res, next) {
    if (!req.session || !req.session.user) {
        return res.status(401).json({
            success: false,
            message: "Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục."
        })
    }
    next() // Cho phép đi tiếp vào route chính
}

// 2. Middleware phân quyền vai trò (chỉ cho phép các role được định nghĩa đi qua)
function requireRoles(allowedRoles = []) {
    return (req, res, next) => {
        if (!req.session || !req.session.user) {
            return res.status(401).json({
                success: false,
                message: "Bạn chưa đăng nhập."
            })
        }
        
        const userRole = req.session.user.role
        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: "Bạn không có quyền thực hiện thao tác này."
            })
        }
        next() // Đúng role thì cho đi tiếp
    }
}

module.exports = {
    requireLogin,
    requireRoles
}
