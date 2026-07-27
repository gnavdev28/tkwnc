import React, { useState, useEffect } from 'react'
import api from '../api'
import PayModal from '../components/PayModal.jsx'
import '../css/Billing.css'

function Billing() {
  const [billings, setBillings] = useState([])
  const [selectedBilling, setSelectedBilling] = useState(null)
  const [payments, setPayments] = useState([])
  const [showPayModal, setShowPayModal] = useState(false)

  // Tải dữ liệu hóa đơn khi mở trang
  useEffect(function() {
    loadBillings()
  }, [])

  // Hàm tải danh sách hóa đơn từ máy chủ
  async function loadBillings() {
    try {
      const res = await api.get('/billing')
      if (res.data.success) {
        setBillings(res.data.billings)
      }
    } catch (err) {
      alert('Lỗi tải danh sách hóa đơn tài chính!')
    }
  }

  // Hàm tải lịch sử đóng tiền của ca điều trị
  async function loadPayments(treatmentId) {
    try {
      const res = await api.get(`/billing/payments/${treatmentId}`)
      if (res.data.success) {
        setPayments(res.data.payments)
      }
    } catch (err) {
      alert('Lỗi tải lịch sử đóng tiền!')
    }
  }

  // Xử lý nộp tiền đợt mới từ component con PayModal
  async function handlePayInstallment(amount, notes) {
    try {
      const payload = {
        treatment_id: selectedBilling.id,
        amount_paid: amount,
        notes: notes
      }
      const res = await api.post('/billing/pay', payload)
      if (res.data.success) {
        alert('Ghi nhận đóng tiền thành công!')
        setShowPayModal(false)
        
        loadBillings()
        if (selectedBilling) {
          loadPayments(selectedBilling.id)
          
          setSelectedBilling(function(prev) {
            return {
              ...prev,
              total_paid: prev.total_paid + amount,
              remaining: prev.remaining - amount
            }
          })
        }
      }
    } catch (err) {
      alert('Lỗi ghi nhận thanh toán!')
    }
  }

  // Hàm xuất báo cáo ra file Excel
  function handleExportExcel() {
    window.open('http://localhost:3000/api/billing/export', '_blank')
  }

  return (
    <div className="khung-doanh-thu">
      <div className="tieu-de-doanh-thu">
        <div>
          <h2 className="tieu-de-doanh-thu-text">Quản lý Doanh thu & Trả góp bệnh nhân</h2>
          <p className="tieu-de-doanh-thu-desc">Quản lý hóa đơn điều trị và các đợt thu tiền trả góp</p>
        </div>
        <button onClick={handleExportExcel} className="nut-xuat-excel">
          Xuất Báo Cáo Excel (.xlsx)
        </button>
      </div>

      <div className={`bo-cuc-cot-doanh-thu ${selectedBilling ? 'chia-hai-cot' : 'mot-cot'}`}>
        <div className="hop-danh-sach-hoa-don">
          <h3>Danh sách hóa đơn điều trị</h3>
          
          <div className="danh-sach-hoa-don-cards">
            {billings.map(function(b) {
              const isPaid = b.remaining <= 0
              const isSelected = selectedBilling?.id === b.id

              let nhanTrangThai
              if (isPaid) {
                nhanTrangThai = <span className="the-da-tra">Đã thanh toán</span>
              } else if (Number(b.total_paid) === 0) {
                nhanTrangThai = <span className="the-chua-tra">Chưa trả</span>
              } else {
                nhanTrangThai = <span className="the-tra-gop">Trả góp</span>
              }

              return (
                <div key={b.id} className={`hop-hoa-don-item ${isSelected ? 'hoa-don-dang-chon' : ''}`}>
                  <div className="hoa-don-tieu-de">
                    <span className="ma-ca-kham">Ca #{b.id}</span>
                    <strong className="ten-benh-nhan-dam">{b.patient_name}</strong>
                  </div>
                  
                  <div className="hoa-don-chi-phi">
                    <div>Tổng chi phí: <strong>{Number(b.total_cost).toLocaleString('vi-VN')} đ</strong></div>
                    <div>Đã trả: <span style={{ color: '#16a34a' }}>{Number(b.total_paid).toLocaleString('vi-VN')} đ</span></div>
                    <div>Còn nợ: <span style={{ color: isPaid ? '#64748b' : '#ef4444', fontWeight: 'bold' }}>{Number(b.remaining).toLocaleString('vi-VN')} đ</span></div>
                  </div>

                  <div className="hoa-don-thao-tac">
                    {nhanTrangThai}
                    <button
                      onClick={function() { setSelectedBilling(b); loadPayments(b.id); }}
                      className="nut-xem-chi-tiet"
                    >
                      Chi tiết
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {selectedBilling && (
          <div className="hop-chi-tiet-dong-tien">
            <div className="tieu-de-doanh-thu">
              <h3>Lịch sử đóng tiền: #{selectedBilling.id}</h3>
              {selectedBilling.remaining > 0 && (
                <button onClick={function() { setShowPayModal(true) }} className="nut-thu-tien-moi">
                  Thu tiền đợt mới
                </button>
              )}
            </div>
            <p className="dong-thong-tin-no">
              Bệnh nhân: <strong>{selectedBilling.patient_name}</strong> | Còn nợ: <strong style={{ color: '#ef4444' }}>{selectedBilling.remaining.toLocaleString('vi-VN')} đ</strong>
            </p>

            <div>
              {payments.length === 0 ? (
                <p style={{ color: '#64748b', fontSize: '14px' }}>Chưa có đợt đóng tiền nào.</p>
              ) : (
                payments.map(function(p) {
                  return (
                    <div key={p.id} className="hop-mot-lan-dong">
                      <div className="dong-tien-da-dong">
                        <span>+{Number(p.amount_paid).toLocaleString('vi-VN')} đ</span>
                        <span className="ngay-gio-dong">
                          {new Date(p.payment_date).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      {p.notes && <div className="ghi-chu-dong">Ghi chú: {p.notes}</div>}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}
      </div>

      {showPayModal && (
        <PayModal
          remaining={selectedBilling?.remaining}
          onClose={function() { setShowPayModal(false) }}
          onSubmit={handlePayInstallment}
        />
      )}
    </div>
  )
}

export default Billing
