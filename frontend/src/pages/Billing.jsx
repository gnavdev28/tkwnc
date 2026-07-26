import React, { useState, useEffect } from 'react'
import api from '../api'
import '../css/Billing.css'

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
        {/* Cột 1: Bảng hóa đơn */}
        <div className="hop-danh-sach-hoa-don">
          <h3>Danh sách hóa đơn điều trị</h3>
          <table className="bang-hoa-don">
            <thead>
              <tr className="dong-tieu-de-hoa-don">
                <th className="o-tieu-de-hoa-don">Mã ca</th>
                <th className="o-tieu-de-hoa-don">Bệnh nhân</th>
                <th className="o-tieu-de-hoa-don" style={{ textAlign: 'right' }}>Tổng chi phí</th>
                <th className="o-tieu-de-hoa-don" style={{ textAlign: 'right' }}>Đã trả</th>
                <th className="o-tieu-de-hoa-don" style={{ textAlign: 'right' }}>Còn nợ</th>
                <th className="o-tieu-de-hoa-don" style={{ textAlign: 'center' }}>Trạng thái</th>
                <th className="o-tieu-de-hoa-don" style={{ textAlign: 'center' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {billings.map(b => {
                const isPaid = b.remaining <= 0
                const isSelected = selectedBilling?.id === b.id
                return (
                  <tr key={b.id} className={`dong-hoa-don ${isSelected ? 'dong-dang-duoc-chon' : ''}`}>
                    <td className="o-hoa-don-xam">#{b.id}</td>
                    <td className="o-hoa-don-dam">{b.patient_name}</td>
                    <td className="o-hoa-don-phai-dam">{Number(b.total_cost).toLocaleString('vi-VN')} đ</td>
                    <td className="o-hoa-don-phai-xanh">{Number(b.total_paid).toLocaleString('vi-VN')} đ</td>
                    <td className="o-hoa-don-phai-binh-thuong" style={{ color: isPaid ? '#64748b' : '#ef4444', fontWeight: 'bold' }}>
                      {Number(b.remaining).toLocaleString('vi-VN')} đ
                    </td>
                    <td className="o-hoa-don-giua">
                      {isPaid ? (
                        <span className="nhan-da-tra">
                          Đã thanh toán
                        </span>
                      ) : (
                        <span className="nhan-tra-gop">
                          Trả góp
                        </span>
                      )}
                    </td>
                    <td className="o-hoa-don-giua">
                      <button
                        onClick={() => { setSelectedBilling(b); loadPayments(b.id); }}
                        className="nut-xem-chi-tiet"
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
          <div className="hop-chi-tiet-dong-tien">
            <div className="tieu-de-doanh-thu">
              <h3>Lịch sử đóng tiền: #{selectedBilling.id}</h3>
              {selectedBilling.remaining > 0 && (
                <button onClick={() => setShowPayModal(true)} className="nut-thu-tien-moi">
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
                payments.map(p => (
                  <div key={p.id} className="hop-mot-lan-dong">
                    <div className="dong-tien-da-dong">
                      <span>+{Number(p.amount_paid).toLocaleString('vi-VN')} đ</span>
                      <span className="ngay-gio-dong">
                        {new Date(p.payment_date).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    {p.notes && <div className="ghi-chu-dong">Ghi chú: {p.notes}</div>}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal thu tiền đóng trả góp */}
      {showPayModal && (
        <div className="nen-overlay-popup">
          <div className="hop-popup-nho-sieu-nho">
            <h3 style={{ margin: '0 0 15px 0', color: '#1e3a8a' }}>Ghi nhận đóng tiền mới</h3>
            <form onSubmit={handlePayInstallment} className="form-popup-doc">
              <div className="dong-nhap-lieu-don">
                <label className="nhan-dien-o-nhap">Số tiền thu (VNĐ)</label>
                <input
                  type="number"
                  placeholder="Nhập số tiền đóng..."
                  value={payAmount}
                  onChange={e => setPayAmount(e.target.value)}
                  max={selectedBilling?.remaining}
                  required
                  className="o-o-nhap-tien"
                />
              </div>
              <div className="dong-nhap-lieu-don">
                <label className="nhan-dien-o-nhap">Ghi chú</label>
                <textarea
                  placeholder="Ví dụ: Đóng tiền đợt 2..."
                  value={payNotes}
                  onChange={e => setPayNotes(e.target.value)}
                  className="o-nhap-chu-nhieu-dong"
                />
              </div>
              <div className="o-nut-bam-popup">
                <button type="button" onClick={() => setShowPayModal(false)} className="nut-bam-huy">Hủy</button>
                <button type="submit" className="nut-bam-cap-nhat">Xác nhận</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Billing
