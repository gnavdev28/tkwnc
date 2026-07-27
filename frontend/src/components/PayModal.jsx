import React, { useState } from 'react'

function PayModal({ remaining, onClose, onSubmit }) {
  const [payAmount, setPayAmount] = useState('')
  const [payNotes, setPayNotes] = useState('')

  // Xử lý nộp form đóng tiền
  function handleFormSubmit(e) {
    e.preventDefault()
    
    if (Number(payAmount) > remaining) {
      alert(`Số tiền đóng không được vượt quá số tiền còn nợ: ${remaining.toLocaleString('vi-VN')} VNĐ`)
      return
    }

    onSubmit(Number(payAmount), payNotes)
  }

  return (
    <div className="nen-overlay-popup">
      <div className="hop-popup-nho-sieu-nho">
        <h3 style={{ margin: '0 0 15px 0', color: '#1e3a8a' }}>Ghi nhận đóng tiền mới</h3>
        <form onSubmit={handleFormSubmit} className="form-popup-doc">
          <div className="dong-nhap-lieu-don">
            <label className="nhan-dien-o-nhap">Số tiền thu (VNĐ)</label>
            <input
              type="number"
              placeholder="Nhập số tiền đóng..."
              value={payAmount}
              onChange={function(e) { setPayAmount(e.target.value) }}
              max={remaining}
              required
              className="o-o-nhap-tien"
            />
          </div>
          <div className="dong-nhap-lieu-don">
            <label className="nhan-dien-o-nhap">Ghi chú</label>
            <textarea
              placeholder="Ví dụ: Đóng tiền đợt 2..."
              value={payNotes}
              onChange={function(e) { setPayNotes(e.target.value) }}
              className="o-nhap-chu-nhieu-dong"
            />
          </div>
          <div className="o-nut-bam-popup">
            <button type="button" onClick={onClose} className="nut-bam-huy">Hủy</button>
            <button type="submit" className="nut-bam-cap-nhat">Xác nhận</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PayModal
