import React, { useState, useEffect } from 'react'
import api from '../api'

function Billing() {
  const [billings, setBillings] = useState([])
  const [selectedBilling, setSelectedBilling] = useState(null)
  const [payments, setPayments] = useState([])
  const [showPayModal, setShowPayModal] = useState(false)
  const [payAmount, setPayAmount] = useState('')
  const [payNotes, setPayNotes] = useState('')

  useEffect(() => {
    loadBillings()
  }, [])

  const loadBillings = async () => {
    try {
      const res = await api.get('/billing')
      if (res.data.success) {
        setBillings(res.data.billings)
      }
    } catch (err) {
      alert('Lỗi tải danh sách hóa đơn tài chính!')
    }
  }

  // Tải danh sách các đợt đóng tiền của ca điều trị
  const loadPayments = async (treatmentId) => {
    try {
      const res = await api.get(`/billing/payments/${treatmentId}`)
      if (res.data.success) {
        setPayments(res.data.payments)
      }
    } catch (err) {
      alert('Lỗi tải lịch sử đóng tiền!')
    }
  }

  // Xử lý đóng tiền đợt mới (trả góp)
  const handlePayInstallment = async (e) => {
    e.preventDefault()
    
    // Kiểm tra số tiền đóng không được lớn hơn số tiền còn nợ
    if (Number(payAmount) > selectedBilling.remaining) {
      alert(`Số tiền đóng không được vượt quá số tiền còn nợ: ${selectedBilling.remaining.toLocaleString('vi-VN')} VNĐ`)
      return
    }

    try {
      const payload = {
        treatment_id: selectedBilling.id,
        amount_paid: Number(payAmount),
        notes: payNotes
      }
      const res = await api.post('/billing/pay', payload)
      if (res.data.success) {
        alert('Ghi nhận đóng tiền thành công!')
        setShowPayModal(false)
        setPayAmount('')
        setPayNotes('')
        
        // Cập nhật lại số dư hiển thị
        loadBillings()
        if (selectedBilling) {
          loadPayments(selectedBilling.id)
          // Cập nhật lại thông tin trong state selectedBilling
          setSelectedBilling(prev => ({
            ...prev,
            total_paid: prev.total_paid + Number(payAmount),
            remaining: prev.remaining - Number(payAmount)
          }))
        }
      }
    } catch (err) {
      alert('Lỗi ghi nhận thanh toán!')
    }
  }

  // Xuất file Excel báo cáo doanh thu
  const handleExportExcel = () => {
    // Mở trực tiếp link API xuất Excel của backend trong tab mới để kích hoạt download
    window.open('http://localhost:3000/api/billing/export', '_blank')
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2>Quản lý Doanh thu & Trả góp bệnh nhân</h2>
          <p style={{ color: '#64748b', margin: 0 }}>Quản lý hóa đơn điều trị và các đợt thu tiền trả góp</p>
        </div>
        <button 
          onClick={handleExportExcel}
          style={{
            padding: '10px 18px',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          Xuất Báo Cáo Excel (.xlsx)
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedBilling ? '1.2fr 0.8fr' : '1fr', gap: '20px' }}>
        {/* Cột 1: Bảng hóa đơn */}
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <h3>Danh sách hóa đơn điều trị</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9', textAlign: 'left' }}>
                <th style={{ padding: '10px', borderBottom: '2px solid #cbd5e1' }}>Mã ca</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #cbd5e1' }}>Bệnh nhân</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #cbd5e1', textAlign: 'right' }}>Tổng chi phí</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #cbd5e1', textAlign: 'right' }}>Đã trả</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #cbd5e1', textAlign: 'right' }}>Còn nợ</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #cbd5e1', textAlign: 'center' }}>Trạng thái</th>
                <th style={{ padding: '10px', borderBottom: '2px solid #cbd5e1', textAlign: 'center' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {billings.map(b => {
                const isPaid = b.remaining <= 0
                return (
                  <tr key={b.id} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: selectedBilling?.id === b.id ? '#eff6ff' : 'transparent' }}>
                    <td style={{ padding: '10px', color: '#64748b' }}>#{b.id}</td>
                    <td style={{ padding: '10px', fontWeight: 'bold' }}>{b.patient_name}</td>
                    <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold' }}>{Number(b.total_cost).toLocaleString('vi-VN')} đ</td>
                    <td style={{ padding: '10px', textAlign: 'right', color: '#16a34a' }}>{Number(b.total_paid).toLocaleString('vi-VN')} đ</td>
                    <td style={{ padding: '10px', textAlign: 'right', color: isPaid ? '#64748b' : '#ef4444' }}>
                      {Number(b.remaining).toLocaleString('vi-VN')} đ
                    </td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>
                      {isPaid ? (
                        <span style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '3px 6px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                          Đã thanh toán
                        </span>
                      ) : (
                        <span style={{ backgroundColor: '#ffedd5', color: '#ea580c', padding: '3px 6px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                          Trả góp
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>
                      <button
                        onClick={() => { setSelectedBilling(b); loadPayments(b.id); }}
                        style={{ padding: '4px 8px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                      >
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Cột 2: Chi tiết đóng tiền (nếu chọn) */}
        {selectedBilling && (
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>Lịch sử đóng tiền: #{selectedBilling.id}</h3>
              {selectedBilling.remaining > 0 && (
                <button
                  onClick={() => setShowPayModal(true)}
                  style={{ padding: '6px 12px', backgroundColor: '#e0f2fe', color: '#0369a1', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
                >
                  Thu tiền đợt mới
                </button>
              )}
            </div>
            <p style={{ margin: '5px 0 15px 0', fontSize: '14px', color: '#64748b' }}>
              Bệnh nhân: <strong>{selectedBilling.patient_name}</strong> | Còn nợ: <strong style={{ color: '#ef4444' }}>{selectedBilling.remaining.toLocaleString('vi-VN')} đ</strong>
            </p>

            <div>
              {payments.length === 0 ? (
                <p style={{ color: '#64748b', fontSize: '14px' }}>Chưa có đợt đóng tiền nào.</p>
              ) : (
                payments.map(p => (
                  <div key={p.id} style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px', marginBottom: '10px', backgroundColor: '#f8fafc' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: '#16a34a', fontSize: '14px' }}>
                      <span>+{Number(p.amount_paid).toLocaleString('vi-VN')} đ</span>
                      <span style={{ color: '#64748b', fontSize: '12px', fontWeight: 'normal' }}>
                        {new Date(p.payment_date).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    {p.notes && <div style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic', marginTop: '4px' }}>Ghi chú: {p.notes}</div>}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal thu tiền đóng trả góp */}
      {showPayModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '8px', width: '350px' }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#1e3a8a' }}>Ghi nhận đóng tiền mới</h3>
            <form onSubmit={handlePayInstallment} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Số tiền thu (VNĐ)</label>
                <input
                  type="number"
                  placeholder="Nhập số tiền đóng..."
                  value={payAmount}
                  onChange={e => setPayAmount(e.target.value)}
                  max={selectedBilling?.remaining}
                  required
                  style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Ghi chú</label>
                <textarea
                  placeholder="Ví dụ: Đóng tiền đợt 2..."
                  value={payNotes}
                  onChange={e => setPayNotes(e.target.value)}
                  style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowPayModal(false)} style={{ padding: '8px 15px' }}>Hủy</button>
                <button type="submit" style={{ padding: '8px 15px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}>Xác nhận</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Billing
