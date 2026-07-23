import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

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
    <div style={{
      maxWidth: '400px',
      margin: '100px auto',
      padding: '30px',
      borderRadius: '8px',
      backgroundColor: 'white',
      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
      border: '1px solid #e2e8f0',
      textAlign: 'center',
      fontFamily: 'sans-serif'
    }}>
      <h2 style={{ color: '#1e3a8a', marginBottom: '10px' }}>Hệ thống Nha Khoa</h2>
      <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '25px' }}>
        {require2FA ? 'Xác thực bảo mật OTP 2FA' : 'Đăng nhập vào hệ thống quản lý phòng khám'}
      </p>

      {error && (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fee2e2',
          color: '#ef4444',
          padding: '10px',
          borderRadius: '4px',
          fontSize: '14px',
          marginBottom: '20px',
          textAlign: 'left'
        }}>
          {error}
        </div>
      )}

      {!require2FA ? (
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'left' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '5px', color: '#334155' }}>
              Tên đăng nhập
            </label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '5px', color: '#334155' }}>
              Mật khẩu
            </label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button 
            type="submit"
            style={{
              marginTop: '10px',
              padding: '12px',
              backgroundColor: '#1e3a8a',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '16px'
            }}
          >
            Đăng nhập
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOTP} style={{ display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'left' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '5px', color: '#334155' }}>
              Nhập mã OTP 6 số
            </label>
            <input 
              type="text" 
              maxLength="6"
              value={otp} 
              onChange={(e) => setOtp(e.target.value)} 
              placeholder="000000"
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                boxSizing: 'border-box',
                letterSpacing: '5px',
                textAlign: 'center',
                fontSize: '18px',
                fontWeight: 'bold'
              }}
            />
          </div>

          <button 
            type="submit"
            style={{
              marginTop: '10px',
              padding: '12px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '16px'
            }}
          >
            Xác minh OTP
          </button>
          
          <button 
            type="button" 
            onClick={() => setRequire2FA(false)}
            style={{
              backgroundColor: 'transparent',
              color: '#64748b',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'center',
              fontSize: '14px',
              textDecoration: 'underline'
            }}
          >
            Quay lại
          </button>
        </form>
      )}
    </div>
  )
}

export default Login
