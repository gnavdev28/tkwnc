import React, { useState } from 'react'

function AddMaterialModal({ onClose, onSubmit }) {
  const [name, setName] = useState('')
  const [unit, setUnit] = useState('')
  const [quantity, setQuantity] = useState('')
  const [minQuantity, setMinQuantity] = useState('')

  // Xử lý nộp form thêm mới
  function handleFormSubmit(e) {
    e.preventDefault()
    onSubmit({
      name: name,
      unit: unit,
      quantity: Number(quantity),
      min_quantity: Number(minQuantity)
    })
  }

  return (
    <div className="nen-overlay-popup">
      <div className="hop-popup-nho">
        <h3 style={{ margin: '0 0 15px 0', color: '#1e3a8a' }}>Thêm vật tư y tế mới</h3>
        <form onSubmit={handleFormSubmit} className="form-popup-doc">
          <div className="dong-nhap-lieu-don">
            <label className="nhan-dien-o-nhap">Tên vật tư</label>
            <input 
              type="text" 
              value={name} 
              onChange={function(e) { setName(e.target.value) }} 
              required 
              className="o-o-nhap-kho" 
            />
          </div>
          <div className="dong-nhap-lieu-don">
            <label className="nhan-dien-o-nhap">Đơn vị tính</label>
            <input 
              type="text" 
              value={unit} 
              onChange={function(e) { setUnit(e.target.value) }} 
              required 
              className="o-o-nhap-kho" 
            />
          </div>
          <div className="dong-nhap-lieu-don">
            <label className="nhan-dien-o-nhap">Số lượng ban đầu</label>
            <input 
              type="number" 
              value={quantity} 
              onChange={function(e) { setQuantity(e.target.value) }} 
              required 
              className="o-o-nhap-kho" 
            />
          </div>
          <div className="dong-nhap-lieu-don">
            <label className="nhan-dien-o-nhap">Ngưỡng tối thiểu</label>
            <input 
              type="number" 
              value={minQuantity} 
              onChange={function(e) { setMinQuantity(e.target.value) }} 
              required 
              className="o-o-nhap-kho" 
            />
          </div>
          <div className="o-nut-bam-popup">
            <button type="button" onClick={onClose} className="nut-bam-huy">Hủy</button>
            <button type="submit" className="nut-bam-them-moi">Thêm mới</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddMaterialModal
