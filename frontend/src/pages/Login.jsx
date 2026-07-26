import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import '../css/Login.css'

function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [require2FA, setRequire2FA] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const response = await api.post('/auth/login', { username, password })
      const result = response.data
      
      if (result.success) {
        if (result.require2FA) {
          setRequire2FA(true)
        } else {
          onLogin(result.user)
          navigate('/dashboard')
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại.')
    }
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const response = await api.post('/auth/2fa/verify', { token: otp })
      const result = response.data
      
      if (result.success) {
        onLogin(result.user)
        navigate('/dashboard')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Mã OTP không hợp lệ.')
    }
  }

  return (
    <div className="khung-dang-nhap">
      <h2 className="tieu-de-logo">Hệ thống Nha Khoa</h2>
      <p className="dong-mo-ta-phu">
        {require2FA ? 'Xác thực bảo mật OTP 2FA' : 'Đăng nhập vào hệ thống quản lý phòng khám'}
      </p>

      {error && (
        <div className="hop-thong-bao-loi">
          {error}
        </div>
      )}

      {!require2FA ? (
        <form onSubmit={handleLogin} className="form-dang-nhap">
          <div>
            <label className="nhan-o-nhap">
              Tên đăng nhập
            </label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required
              className="o-nhap-lieu-thuong"
            />
          </div>

          <div>
            <label className="nhan-o-nhap">
              Mật khẩu
            </label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required
              className="o-nhap-lieu-thuong"
            />
          </div>

          <button type="submit" className="nut-bam-xac-nhan">
            Đăng nhập
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOTP} className="form-dang-nhap">
          <div>
            <label className="nhan-o-nhap">
              Nhập mã OTP 6 số
            </label>
            <input 
              type="text" 
              maxLength="6"
              value={otp} 
              onChange={(e) => setOtp(e.target.value)} 
              placeholder="000000"
              required
              className="o-nhap-otp-to"
            />
          </div>

          <button type="submit" className="nut-bam-xac-minh-otp">
            Xác minh OTP
          </button>
          
          <button 
            type="button" 
            onClick={() => setRequire2FA(false)}
            className="nut-quay-lai-dang-nhap"
          >
            Quay lại
          </button>
        </form>
      )}
    </div>
  )
}

export default Login
