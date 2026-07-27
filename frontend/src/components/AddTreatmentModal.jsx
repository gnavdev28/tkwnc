import React, { useState, useEffect } from 'react'
import api from '../api'
import SignaturePad from './SignaturePad'

function AddTreatmentModal({ patientName, onClose, onSubmit }) {
  const [treatmentDate, setTreatmentDate] = useState(new Date().toISOString().split('T')[0])
  const [toothNumber, setToothNumber] = useState('11')
  const [condition, setCondition] = useState('decayed')
  const [totalCost, setTotalCost] = useState('')
  const [notes, setNotes] = useState('')
  const [signatureBase64, setSignatureBase64] = useState('')
  const [availableMaterials, setAvailableMaterials] = useState([])

  // Tải danh sách vật tư kho khi mở popup
  useEffect(function() {
    api.get('/inventory')
      .then(function(res) {
        if (res.data.success) {
          const formatted = res.data.materials.map(function(m) {
            return { 
              ...m, 
              checked: false, 
              quantity_used: 1 
            }
          })
          setAvailableMaterials(formatted)
        }
      })
      .catch(function(err) {
        console.error(err)
      })
  }, [])

  // Xử lý nộp form tạo ca khám mới
  function handleFormSubmit(e) {
    e.preventDefault()

    // Lọc danh sách các vật tư y tế đã được chọn sử dụng
    const usedMaterials = availableMaterials
      .filter(function(m) { return m.checked })
      .map(function(m) {
        return {
          material_id: m.id,
          quantity_used: m.quantity_used
        }
      })

    onSubmit({
      treatment_date: treatmentDate,
      tooth_number: toothNumber,
      condition: condition,
      total_cost: totalCost,
      notes: notes,
      signatureBase64: signatureBase64,
      usedMaterials: usedMaterials
    })
  }

  const teethList = [
    18,17,16,15,14,13,12,11, 21,22,23,24,25,26,27,28,
    48,47,46,45,44,43,42,41, 31,32,33,34,35,36,37,38
  ]

  return (
    <div className="nen-mo-hop-thoai-phu-man-hinh">
      <div className="than-hop-thoai-to">
        <h3>Tạo hồ sơ Bệnh án mới: {patientName}</h3>
        <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Ngày điều trị</label>
            <input type="date" value={treatmentDate} onChange={function(e) { setTreatmentDate(e.target.value) }} required className="o-nhap-chu" />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Chọn Răng điều trị</label>
              <select value={toothNumber} onChange={function(e) { setToothNumber(e.target.value) }} className="o-chon-lua-drop-down">
                {teethList.map(function(t) {
                  return <option key={t} value={t}>Răng {t}</option>
                })}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Bệnh lý / Thủ thuật</label>
              <select value={condition} onChange={function(e) { setCondition(e.target.value) }} className="o-chon-lua-drop-down">
                <option value="decayed">Sâu răng</option>
                <option value="missing">Đã nhổ răng</option>
                <option value="filled">Trám răng</option>
                <option value="crown">Bọc mão sứ</option>
                <option value="implant">Cấy ghép Implant</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Tổng chi phí điều trị (VNĐ)</label>
            <input type="number" placeholder="Ví dụ: 2000000" value={totalCost} onChange={function(e) { setTotalCost(e.target.value) }} required className="o-nhap-chu" />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Vật tư tiêu hao sử dụng</label>
            <div className="hop-chua-danh-sach-thuoc">
              {availableMaterials.length === 0 ? (
                <span style={{ fontSize: '13px', color: '#64748b' }}>Không tìm thấy vật tư trong kho.</span>
              ) : (
                availableMaterials.map(function(m, idx) {
                  return (
                    <div key={m.id} className="dong-mot-loai-thuoc">
                      <label className="chu-tich-chon-thuoc">
                        <input 
                          type="checkbox" 
                          checked={m.checked} 
                          onChange={function(e) {
                            const updated = [...availableMaterials]
                            updated[idx].checked = e.target.checked
                            setAvailableMaterials(updated)
                          }}
                        />
                        {m.name} (Còn lại: {m.quantity} {m.unit})
                      </label>
                      
                      {m.checked && (
                        <input 
                          type="number" 
                          min="1" 
                          max={m.quantity}
                          value={m.quantity_used}
                          onChange={function(e) {
                            const updated = [...availableMaterials]
                            updated[idx].quantity_used = Number(e.target.value)
                            setAvailableMaterials(updated)
                          }}
                          className="o-nhap-so-luong-thuoc-dung"
                        />
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Ghi chú điều trị</label>
            <textarea rows="2" placeholder="Tình trạng răng miệng..." value={notes} onChange={function(e) { setNotes(e.target.value) }} className="o-nhap-chu-nhieu-dong" />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Chữ ký cam kết của bệnh nhân (Vẽ bằng chuột/tay)</label>
            <div className="hop-chua-bang-ve-chu-ky">
              <SignaturePad onSave={function(base64) { setSignatureBase64(base64) }} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={onClose} className="nut-huy-bo">Hủy</button>
            <button type="submit" className="nut-cap-nhat">Lưu bệnh án</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddTreatmentModal
