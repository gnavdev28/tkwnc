import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom'
import api from './api'

// Import các trang rỗng để định tuyến
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Patients from './pages/Patients.jsx'
import Inventory from './pages/Inventory.jsx'
import Billing from './pages/Billing.jsx'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Gọi API /me để kiểm tra phiên đăng nhập cũ khi tải trang
  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await api.get('/auth/me')
        if (response.data.success) {
          setUser(response.data.user)
        }
      } catch (error) {
        console.log('Chưa đăng nhập hoặc phiên làm việc đã hết hạn.')
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [])

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout')
      setUser(null)
    } catch (error) {
      alert('Lỗi đăng xuất!')
    }
  }

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>Đang tải dữ liệu...</div>
  }

  return (
    <Router>
      <div style={{ fontFamily: 'sans-serif', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Thanh điều hướng (Navbar) hiển thị khi đã đăng nhập */}
        {user && (
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 30px', backgroundColor: '#1e3a8a', color: 'white' }}>
            <h2 style={{ margin: 0 }}>🦷 Nha Khoa</h2>
            <nav style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <Link to="/dashboard" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>Dashboard</Link>
              <Link to="/patients" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>Bệnh nhân</Link>
              <Link to="/inventory" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>Kho vật tư</Link>
              <Link to="/billing" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>Doanh thu & Trả góp</Link>
              <span style={{ marginLeft: '10px', color: '#93c5fd' }}>Xin chào, {user.fullname} ({user.role})</span>
              <button onClick={handleLogout} style={{ padding: '6px 12px', border: 'none', backgroundColor: '#ef4444', color: 'white', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Đăng xuất</button>
            </nav>
          </header>
        )}

        {/* Nội dung các trang */}
        <main style={{ flex: 1, padding: '20px' }}>
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
