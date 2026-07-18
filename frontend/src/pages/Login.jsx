import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  // Xử lý khi nhấn nút Đăng nhập
  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    try {
      // Gửi tài khoản + mật khẩu lên Express Backend bằng Axios
      const response = await api.post('/auth/login', { username, password })
      const result = response.data
      
      if (result.success) {
        // Lưu thông tin người dùng vào App State và chuyển vào trang Dashboard
        onLogin(result.user)
        navigate('/dashboard')
      }
    } catch (err) {
      // Hiển thị lỗi nếu sai tài khoản hoặc mật khẩu
      setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản.')
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
      <h2 style={{ color: '#1e3a8a', marginBottom: '10px' }}>🦷 Hệ thống Nha Khoa</h2>
      <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '25px' }}>
        Đăng nhập vào hệ thống quản lý phòng khám
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
            fontSize: '16px',
            transition: 'background-color 0.2s'
          }}
        >
          Đăng nhập
        </button>
      </form>
    </div>
  )
}

export default Login
