import React, { useState } from 'react'

function EditMaterialModal({ material, onClose, onSubmit }) {
  const [editQty, setEditQty] = useState(material.quantity)

  // Xử lý nộp form cập nhật
  function handleFormSubmit(e) {
    e.preventDefault()
    onSubmit(Number(editQty))
  }

  return (
    <div className="nen-overlay-popup">
      <div className="hop-popup-nho-sieu-nho">
        <h3 style={{ margin: '0 0 15px 0', color: '#1e3a8a' }}>Nhập/Sửa số lượng kho</h3>
        <p style={{ fontSize: '14px', color: '#475569', margin: '0 0 15px 0' }}>
          Thay đổi số lượng cho vật tư: <strong>{material.name}</strong> ({material.unit})
        </p>
        <form onSubmit={handleFormSubmit} className="form-popup-doc">
          <div className="dong-nhap-lieu-don">
            <label className="nhan-dien-o-nhap">Số lượng mới</label>
            <input 
              type="number" 
              value={editQty} 
              onChange={function(e) { setEditQty(e.target.value) }} 
              required 
              className="o-o-nhap-kho" 
            />
          </div>
          <div className="o-nut-bam-popup">
            <button type="button" onClick={onClose} className="nut-bam-huy">Hủy</button>
            <button type="submit" className="nut-bam-cap-nhat">Cập nhật</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditMaterialModal
