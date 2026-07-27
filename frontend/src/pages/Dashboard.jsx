import React, { useState, useEffect } from 'react'
import api from '../api'
import { Link } from 'react-router-dom'
import '../css/Dashboard.css'

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

  // Tải dữ liệu thống kê
  useEffect(function() {
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
        billingsList.forEach(function(b) {
          totalRevenue += Number(b.total_cost)
          totalCashCollected += Number(b.total_paid)
        })

        const lowStock = inventoryList.filter(function(m) {
          return m.quantity <= m.min_quantity
        })

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

  // Khởi tạo mã QR để quét 2FA
  async function handleInit2FA() {
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

  // Xác nhận và kích hoạt 2FA
  async function handleEnable2FA(e) {
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
      setError2FA(err.response?.data?.message || 'Mã OTP không chính xác.')
    }
  }

  // Tắt bảo mật 2FA
  async function handleDisable2FA() {
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
    return <div style={{ padding: '20px' }}>Đang tải dữ liệu thống kê...</div>
  }

  return (
    <div className="khung-dashboard">
      <h2 className="tieu-de-trang">Tổng quan hoạt động Phòng khám Nha khoa</h2>
      
      <div className="hop-chi-so-nhanh">
        <div className="the-chi-so">
          <div className="tieu-de-chi-so">TỔNG SỐ BỆNH NHÂN</div>
          <div className="so-luong-chi-so">{stats.totalPatients}</div>
          <Link to="/patients" className="duong-dan-chi-tiet">Quản lý bệnh nhân →</Link>
        </div>

        <div className="the-chi-so">
          <div className="tieu-de-chi-so">TỔNG DOANH THU ĐIỀU TRỊ</div>
          <div className="so-luong-doanh-thu">{stats.totalRevenue.toLocaleString('vi-VN')} đ</div>
          <span className="mo-ta-nho">Tính trên tổng chi phí ghi nhận</span>
        </div>

        <div className="the-chi-so">
          <div className="tieu-de-chi-so">DOANH THU ĐÃ THU TIỀN</div>
          <div className="so-luong-da-thu">{stats.totalCashCollected.toLocaleString('vi-VN')} đ</div>
          <Link to="/billing" className="duong-dan-chi-tiet">Quản lý doanh thu →</Link>
        </div>

        <div className="the-chi-so">
          <div className="tieu-de-chi-so">VẬT TƯ CẦN NHẬP KHO</div>
          <div className={`so-luong-chi-so ${stats.lowStockCount > 0 ? 'so-luong-can-canh-bao' : 'so-luong-an-toan'}`}>
            {stats.lowStockCount}
          </div>
          <Link to="/inventory" className="duong-dan-chi-tiet">Kiểm tra kho vật tư →</Link>
        </div>
      </div>

      <div className="bo-cuc-hai-phan">
        <div className="hop-canh-bao-kho">
          <h3>Cảnh báo kho vật tư (Hết hàng hoặc tồn kho thấp)</h3>
          {stats.lowStockItems.length === 0 ? (
            <p style={{ color: '#15803d', fontSize: '14px', marginTop: '15px', fontWeight: 'bold' }}>
              Kho y tế ở trạng thái an toàn, không có vật tư nào dưới ngưỡng tối thiểu.
            </p>
          ) : (
            <table className="table-canh-bao">
              <thead>
                <tr className="table-header">
                  <th className="th-style">Vật tư</th>
                  <th className="th-style" style={{ textAlign: 'center' }}>Tồn kho</th>
                  <th className="th-style" style={{ textAlign: 'center' }}>Ngưỡng cảnh báo</th>
                </tr>
              </thead>
              <tbody>
                {stats.lowStockItems.map(function(item) {
                  return (
                    <tr key={item.id} className="tr-loi">
                      <td className="td-style">{item.name} ({item.unit})</td>
                      <td className="td-style" style={{ textAlign: 'center' }}>{item.quantity}</td>
                      <td className="td-style" style={{ textAlign: 'center', color: '#64748b' }}>{item.min_quantity}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="hop-ben-phai">


          <div className="hop-bao-mat-hai-lop">
            <h3 className="tieu-de-bao-mat">Bảo mật tài khoản 2 lớp (2FA)</h3>
            {error2FA && <p style={{ color: 'red', fontSize: '13px' }}>{error2FA}</p>}
            
            {user?.twofa_enabled ? (
              <div>
                <p className="chu-khi-bat">Trạng thái: ĐÃ BẬT BẢO MẬT 2 LỚP</p>
                <button onClick={handleDisable2FA} className="nut-tat-2fa">
                  Tắt bảo mật 2FA
                </button>
              </div>
            ) : (
              <div>
                <p className="chu-chua-bat">Trạng thái: CHƯA BẬT BẢO MẬT 2 LỚP</p>
                {!temp2FA ? (
                  <button onClick={handleInit2FA} className="nut-bat-2fa">
                    Kích hoạt bảo mật 2FA
                  </button>
                ) : (
                  <div className="khung-xac-thuc-otp">
                    <p style={{ fontSize: '13px', color: '#64748b' }}>Quét mã QR dưới đây bằng Google Authenticator:</p>
                    <img src={temp2FA.qrCodeUrl} alt="QR Code 2FA" className="anh-ma-qr" />
                    <p style={{ fontSize: '12px', color: '#64748b' }}>Khóa dự phòng: <code>{temp2FA.secret}</code></p>
                    
                    <form onSubmit={handleEnable2FA} className="form-xac-nhan-2fa">
                      <input 
                        type="text" 
                        maxLength="6" 
                        placeholder="Mã OTP 6 số" 
                        value={otpCode}
                        onChange={function(e) { setOtpCode(e.target.value) }}
                        required
                        className="o-nhap-ma-otp"
                      />
                      <button type="submit" className="nut-submit-otp">Kích hoạt</button>
                    </form>
                    <button type="button" onClick={function() { setTemp2FA(null) }} className="nut-cancel-otp">Hủy bỏ</button>
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
