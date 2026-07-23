import React, { useState, useEffect } from 'react'
import api from '../api'
import { Link } from 'react-router-dom'

function Dashboard({ user, onUserUpdate }) {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalRevenue: 0,
    totalCashCollected: 0,
    lowStockCount: 0,
    lowStockItems: []
  })
  const [loading, setLoading] = useState(true)
  
  const [temp2FA, setTemp2FA] = useState(null)
  const [otpCode, setOtpCode] = useState('')
  const [error2FA, setError2FA] = useState('')

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [patientsRes, billingRes, inventoryRes] = await Promise.all([
          api.get('/patients'),
          api.get('/billing'),
          api.get('/inventory')
        ])

        const patientsList = patientsRes.data.patients || []
        const billingsList = billingRes.data.billings || []
        const inventoryList = inventoryRes.data.materials || []

        let totalRevenue = 0
        let totalCashCollected = 0
        billingsList.forEach(b => {
          totalRevenue += Number(b.total_cost)
          totalCashCollected += Number(b.total_paid)
        })

        const lowStock = inventoryList.filter(m => m.quantity <= m.min_quantity)

        setStats({
          totalPatients: patientsList.length,
          totalRevenue,
          totalCashCollected,
          lowStockCount: lowStock.length,
          lowStockItems: lowStock
        })
      } catch (error) {
        console.error('Lỗi tải dữ liệu Dashboard:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  const handleInit2FA = async () => {
    setError2FA('')
    try {
      const res = await api.post('/auth/2fa/setup')
      if (res.data.success) {
        setTemp2FA(res.data)
      }
    } catch (err) {
      setError2FA('Không thể khởi tạo mã QR.')
    }
  }

  const handleEnable2FA = async (e) => {
    e.preventDefault()
    setError2FA('')
    try {
      const res = await api.post('/auth/2fa/enable', { token: otpCode })
      if (res.data.success) {
        alert('Kích hoạt bảo mật 2 lớp thành công!')
        onUserUpdate({ ...user, twofa_enabled: 1 })
        setTemp2FA(null)
        setOtpCode('')
      }
    } catch (err) {
      setError2FA(err.response?.data?.message || 'Mã xác nhận không đúng.')
    }
  }

  const handleDisable2FA = async () => {
    if (!window.confirm('Bạn có chắc muốn tắt bảo mật 2 lớp?')) return
    setError2FA('')
    try {
      const res = await api.post('/auth/2fa/disable')
      if (res.data.success) {
        alert('Đã tắt bảo mật 2 lớp thành công!')
        onUserUpdate({ ...user, twofa_enabled: 0 })
      }
    } catch (err) {
      setError2FA('Lỗi hệ thống khi tắt 2FA.')
    }
  }

  if (loading) {
    return <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>Đang tổng hợp dữ liệu...</div>
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h2 style={{ marginBottom: '20px', color: '#1e3a8a' }}>📊 Tổng quan hoạt động Phòng khám Nha khoa</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ color: '#64748b', fontSize: '14px', fontWeight: 'bold' }}>TỔNG SỐ BỆNH NHÂN</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', margin: '10px 0', color: '#1e3a8a' }}>{stats.totalPatients}</div>
          <Link to="/patients" style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '13px', fontWeight: 'bold' }}>Quản lý bệnh nhân →</Link>
        </div>

        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ color: '#64748b', fontSize: '14px', fontWeight: 'bold' }}>TỔNG DOANH THU ĐIỀU TRỊ</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', margin: '10px 0', color: '#1e3a8a' }}>{stats.totalRevenue.toLocaleString('vi-VN')} đ</div>
          <span style={{ fontSize: '12px', color: '#64748b' }}>Tính trên tổng chi phí ghi nhận</span>
        </div>

        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ color: '#64748b', fontSize: '14px', fontWeight: 'bold' }}>DOANH THU ĐÃ THU TIỀN</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', margin: '10px 0', color: '#16a34a' }}>{stats.totalCashCollected.toLocaleString('vi-VN')} đ</div>
          <Link to="/billing" style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '13px', fontWeight: 'bold' }}>Quản lý doanh thu →</Link>
        </div>

        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ color: '#64748b', fontSize: '14px', fontWeight: 'bold' }}>VẬT TƯ CẦN NHẬP KHO</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', margin: '10px 0', color: stats.lowStockCount > 0 ? '#ef4444' : '#16a34a' }}>
            {stats.lowStockCount}
          </div>
          <Link to="/inventory" style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '13px', fontWeight: 'bold' }}>Kiểm tra kho vật tư →</Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px' }}>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <h3>⚠️ Cảnh báo kho vật tư (Hết hàng hoặc tồn kho thấp)</h3>
          {stats.lowStockItems.length === 0 ? (
            <p style={{ color: '#15803d', fontSize: '14px', marginTop: '15px', fontWeight: 'bold' }}>
              ✓ Kho y tế ở trạng thái an toàn, không có vật tư nào dưới ngưỡng tối thiểu.
            </p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9', textAlign: 'left' }}>
                  <th style={{ padding: '10px', borderBottom: '1px solid #cbd5e1' }}>Vật tư</th>
                  <th style={{ padding: '10px', borderBottom: '1px solid #cbd5e1', textAlign: 'center' }}>Tồn kho</th>
                  <th style={{ padding: '10px', borderBottom: '1px solid #cbd5e1', textAlign: 'center' }}>Ngưỡng cảnh báo</th>
                </tr>
              </thead>
              <tbody>
                {stats.lowStockItems.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0', color: '#ef4444', fontWeight: 'bold' }}>
                    <td style={{ padding: '10px' }}>{item.name} ({item.unit})</td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>{item.quantity}</td>
                    <td style={{ padding: '10px', textAlign: 'center', color: '#64748b' }}>{item.min_quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ backgroundColor: '#eff6ff', padding: '20px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
            <h3 style={{ color: '#1e3a8a', margin: '0 0 15px 0' }}>💡 Quy trình nghiệp vụ:</h3>
            <ul style={{ fontSize: '14px', lineHeight: '22px', paddingLeft: '20px', color: '#1e3a8a' }}>
              <li style={{ marginBottom: '8px' }}>
                <strong>Bước 1:</strong> Thêm thông tin hành chính bệnh nhân mới ở tab <strong>Bệnh nhân</strong>.
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong>Bước 2:</strong> Tạo bệnh án khám, chọn răng điều trị, chọn vật tư y tế sử dụng và cho bệnh nhân <strong>ký tên điện tử</strong> trên màn hình.
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong>Bước 3:</strong> Hệ thống tự động <strong>trừ kho vật tư</strong> tương ứng số lượng đã dùng.
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong>Bước 4:</strong> Theo dõi hóa đơn và tiến hành đóng tiền trả góp theo đợt ở tab <strong>Doanh thu</strong>.
              </li>
            </ul>
          </div>

          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ color: '#1e3a8a', margin: '0 0 15px 0' }}>🔐 Bảo mật tài khoản 2 lớp (2FA)</h3>
            {error2FA && <p style={{ color: 'red', fontSize: '13px' }}>{error2FA}</p>}
            
            {user?.twofa_enabled ? (
              <div>
                <p style={{ color: '#16a34a', fontWeight: 'bold', fontSize: '14px' }}>✓ Trạng thái: ĐÃ BẬT BẢO MẬT 2 LỚP</p>
                <button 
                  onClick={handleDisable2FA} 
                  style={{ width: '100%', padding: '10px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Tắt bảo mật 2FA
                </button>
              </div>
            ) : (
              <div>
                <p style={{ color: '#ea580c', fontWeight: 'bold', fontSize: '14px' }}>✗ Trạng thái: CHƯA BẬT BẢO MẬT 2 LỚP</p>
                {!temp2FA ? (
                  <button 
                    onClick={handleInit2FA} 
                    style={{ width: '100%', padding: '10px', backgroundColor: '#1e3a8a', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Kích hoạt bảo mật 2FA
                  </button>
                ) : (
                  <div style={{ textAlign: 'center', marginTop: '15px' }}>
                    <p style={{ fontSize: '13px', color: '#64748b' }}>Quét mã QR dưới đây bằng Google Authenticator:</p>
                    <img src={temp2FA.qrCodeUrl} alt="QR Code 2FA" style={{ border: '1px solid #cbd5e1', padding: '5px', borderRadius: '4px', margin: '10px 0' }} />
                    <p style={{ fontSize: '12px', color: '#64748b' }}>Khóa dự phòng: <code>{temp2FA.secret}</code></p>
                    
                    <form onSubmit={handleEnable2FA} style={{ display: 'flex', gap: '5px', marginTop: '10px' }}>
                      <input 
                        type="text" 
                        maxLength="6" 
                        placeholder="Mã OTP 6 số" 
                        value={otpCode}
                        onChange={e => setOtpCode(e.target.value)}
                        required
                        style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }}
                      />
                      <button type="submit" style={{ padding: '8px 12px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Kích hoạt</button>
                    </form>
                    <button type="button" onClick={() => setTemp2FA(null)} style={{ background: 'none', border: 'none', color: '#3b82f6', textDecoration: 'underline', marginTop: '10px', cursor: 'pointer', fontSize: '13px' }}>Hủy bỏ</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
