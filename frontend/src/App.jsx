import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom'
import api from './api'
import './css/App.css'

import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Patients from './pages/Patients.jsx'
import Inventory from './pages/Inventory.jsx'
import Billing from './pages/Billing.jsx'

function App() {
  // Tài khoản đăng nhập hiện tại
  const [user, setUser] = useState(null)
  // Trạng thái tải trang
  const [loading, setLoading] = useState(true)

  // Kiểm tra đăng nhập cũ khi tải trang
  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await api.get('/auth/me')
        if (response.data.success) {
          setUser(response.data.user)
        }
      } catch (error) {
        console.log('Chưa đăng nhập hoặc hết hạn phiên làm việc.')
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [])

  // Xử lý đăng xuất
  const handleLogout = async () => {
    try {
      await api.post('/auth/logout')
      setUser(null)
    } catch (error) {
      alert('Lỗi khi đăng xuất!')
    }
  }

  if (loading) {
    return <div className="chu-dang-tai-du-lieu">Đang tải dữ liệu...</div>
  }

  return (
    <Router>
      <div className="khung-layout-chinh">
        {/* Menu điều hướng chính */}
        {user && (
          <header className="thanh-dau-trang-navbar">
            <h2 className="tieu-de-navbar">Nha Khoa</h2>
            <nav className="thanh-dieu-huong-links">
              <Link to="/dashboard" className="duong-dan-menu">Dashboard</Link>
              <Link to="/patients" className="duong-dan-menu">Bệnh nhân</Link>
              <Link to="/inventory" className="duong-dan-menu">Kho vật tư</Link>
              <Link to="/billing" className="duong-dan-menu">Doanh thu & Trả góp</Link>
              <span className="chu-chao-ten-bac-si">Xin chào, {user.fullname}</span>
              <button onClick={handleLogout} className="nut-dang-xuat">Đăng xuất</button>
            </nav>
          </header>
        )}

        {/* Nội dung các trang */}
        <main className="khung-chua-noi-dung">
          <Routes>
            <Route 
              path="/login" 
              element={user ? <Navigate to="/dashboard" /> : <Login onLogin={setUser} />} 
            />
            <Route 
              path="/dashboard" 
              element={user ? <Dashboard user={user} onUserUpdate={setUser} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/patients" 
              element={user ? <Patients /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/inventory" 
              element={user ? <Inventory /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/billing" 
              element={user ? <Billing /> : <Navigate to="/login" />} 
            />
            <Route 
              path="*" 
              element={<Navigate to={user ? "/dashboard" : "/login"} />} 
            />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
