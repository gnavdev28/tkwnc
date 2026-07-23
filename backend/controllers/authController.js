const userModel = require("../models/userModel")
const speakeasy = require("speakeasy")
const qrcode = require("qrcode")

async function register(req, res) {
    try {
        const { username, password, fullname, role } = req.body
        if (!username || !password || !fullname) {
            return res.status(400).json({ success: false, message: "Vui lòng điền đủ thông tin." })
        }
        const existingUser = await userModel.findUserByUsername(username)
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Tên đăng nhập đã tồn tại." })
        }
        await userModel.createUser(username, password, fullname, role)
        res.status(201).json({ success: true, message: "Đăng ký thành công." })
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi hệ thống." })
    }
}

async function login(req, res) {
    try {
        const { username, password } = req.body
        if (!username || !password) {
            return res.status(400).json({ success: false, message: "Vui lòng nhập đủ tài khoản và mật khẩu." })
        }
        const user = await userModel.findUserByUsername(username)
        if (!user) {
            return res.status(401).json({ success: false, message: "Sai tài khoản hoặc mật khẩu." })
        }
        const isMatch = await userModel.verifyPassword(password, user.password)
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Sai tài khoản hoặc mật khẩu." })
        }

        req.session.user = {
            id: user.id,
            username: user.username,
            fullname: user.fullname,
            role: user.role,
            twofa_enabled: user.twofa_enabled
        }

        if (user.twofa_enabled) {
            req.session.twofaVerified = false
            return res.json({ success: true, require2FA: true, message: "Cần xác thực 2FA." })
        }

        res.json({ success: true, require2FA: false, user: req.session.user, message: "Đăng nhập thành công." })
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi hệ thống." })
    }
}

async function getMe(req, res) {
    if (req.session && req.session.user) {
        if (req.session.user.twofa_enabled && !req.session.twofaVerified) {
            return res.status(401).json({ success: false, require2FA: true, message: "Chưa xác thực 2FA." })
        }
        return res.json({ success: true, user: req.session.user })
    }
    res.status(401).json({ success: false, message: "Chưa đăng nhập." })
}

function logout(req, res) {
    if (req.session) {
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ success: false, message: "Lỗi đăng xuất." })
            }
            res.clearCookie("connect.sid")
            res.json({ success: true, message: "Đăng xuất thành công." })
        })
    } else {
        res.json({ success: true, message: "Đã đăng xuất." })
    }
}

async function setup2FA(req, res) {
    try {
        if (!req.session.user) {
            return res.status(401).json({ success: false, message: "Chưa đăng nhập." })
        }
        const secret = speakeasy.generateSecret({ name: `Nha Khoa (${req.session.user.username})` })
        req.session.temp_twofa_secret = secret.base32
        const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url)
        res.json({ success: true, qrCodeUrl, secret: secret.base32 })
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi tạo cấu hình 2FA." })
    }
}

async function enable2FA(req, res) {
    try {
        if (!req.session.user || !req.session.temp_twofa_secret) {
            return res.status(400).json({ success: false, message: "Yêu cầu không hợp lệ." })
        }
        const { token } = req.body
        const verified = speakeasy.totp.verify({
            secret: req.session.temp_twofa_secret,
            encoding: "base32",
            token
        })
        if (!verified) {
            return res.status(400).json({ success: false, message: "Mã OTP không chính xác." })
        }
        await userModel.update2FASecret(req.session.user.id, req.session.temp_twofa_secret, 1)
        req.session.user.twofa_enabled = 1
        req.session.twofaVerified = true
        delete req.session.temp_twofa_secret
        res.json({ success: true, message: "Bật 2FA thành công." })
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi kích hoạt 2FA." })
    }
}

async function disable2FA(req, res) {
    try {
        if (!req.session.user) {
            return res.status(401).json({ success: false, message: "Chưa đăng nhập." })
        }
        await userModel.update2FASecret(req.session.user.id, null, 0)
        req.session.user.twofa_enabled = 0
        req.session.twofaVerified = false
        res.json({ success: true, message: "Tắt 2FA thành công." })
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi tắt 2FA." })
    }
}

async function verify2FA(req, res) {
    try {
        const { token } = req.body
        const sessionUser = req.session.user
        if (!sessionUser) {
            return res.status(401).json({ success: false, message: "Yêu cầu không hợp lệ." })
        }
        const user = await userModel.findUserByUsername(sessionUser.username)
        if (!user || !user.twofa_secret) {
            return res.status(400).json({ success: false, message: "Tài khoản chưa bật 2FA." })
        }
        const verified = speakeasy.totp.verify({
            secret: user.twofa_secret,
            encoding: "base32",
            token
        })
        if (!verified) {
            return res.status(400).json({ success: false, message: "Mã OTP không chính xác." })
        }
        req.session.twofaVerified = true
        res.json({ success: true, user: req.session.user, message: "Xác thực thành công." })
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi xác thực." })
    }
}

module.exports = {
    register,
    login,
    getMe,
    logout,
    setup2FA,
    enable2FA,
    disable2FA,
    verify2FA
}
