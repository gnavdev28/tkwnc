import React, { useState, useEffect } from 'react'
import api from '../api'
import SignaturePad from '../components/SignaturePad'
import '../css/Patients.css'

function Patients() {
  // ==========================================
  // I. KHAI BÁO CÁC KHAY CHỨA DỮ LIỆU (STATE)
  // ==========================================
  const [patients, setPatients] = useState([]) // Danh sách tất cả bệnh nhân
  const [selectedPatient, setSelectedPatient] = useState(null) // Bệnh nhân đang được chọn
  const [treatments, setTreatments] = useState([]) // Lịch sử bệnh án của bệnh nhân được chọn
  
  const [showAddModal, setShowAddModal] = useState(false) // Mở hộp thoại thêm bệnh nhân
  const [showTreatmentModal, setShowTreatmentModal] = useState(false) // Mở hộp thoại khám răng
  const [editingPatient, setEditingPatient] = useState(null) // Bệnh nhân đang sửa
  const [availableMaterials, setAvailableMaterials] = useState([]) // Danh sách thuốc trong kho

  // Khai báo form thêm bệnh nhân mới
  const [newPatient, setNewPatient] = useState({
    fullname: '',
    phone: '',
    email: '',
    dob: '',
    gender: 'male',
    address: ''
  })

  // Khai báo form ca khám mới
  const [newTreatment, setNewTreatment] = useState({
    treatment_date: new Date().toISOString().split('T')[0],
    tooth_number: '11',
    condition: 'decayed',
    total_cost: '',
    notes: '',
    signatureBase64: ''
  })

  // Tự động tải danh sách bệnh nhân khi bắt đầu mở trang
  useEffect(() => {
    loadPatients()
  }, [])

  // Tự động tải danh sách thuốc khi mở hộp thoại khám răng
  useEffect(() => {
    if (showTreatmentModal) {
      api.get('/inventory')
        .then(res => {
          if (res.data.success) {
            const formatted = res.data.materials.map(m => {
              return { 
                ...m, 
                checked: false, 
                quantity_used: 1 
              }
            })
            setAvailableMaterials(formatted)
          }
        })
        .catch(err => console.error(err))
    }
  }, [showTreatmentModal])

  // ==========================================
  // II. CÁC HÀM GỌI MẠNG LÊN MÁY CHỦ (API)
  // ==========================================

  // 1. Tải danh sách bệnh nhân
  const loadPatients = async () => {
    try {
      const res = await api.get('/patients')
      if (res.data.success) {
        setPatients(res.data.patients)
      }
    } catch (err) {
      alert('Lỗi tải danh sách bệnh nhân!')
    }
  }

  // 2. Tải bệnh án của một bệnh nhân
  const loadTreatments = async (patientId) => {
    try {
      const res = await api.get(`/treatments/patient/${patientId}`)
      if (res.data.success) {
        setTreatments(res.data.treatments)
      }
    } catch (err) {
      alert('Lỗi tải lịch sử bệnh án!')
    }
  }

  // 3. Tạo bệnh nhân mới
  const handleCreatePatient = async (e) => {
    e.preventDefault()
    try {
      const res = await api.post('/patients', newPatient)
      if (res.data.success) {
        alert('Thêm bệnh nhân thành công!')
        setShowAddModal(false)
        setNewPatient({ fullname: '', phone: '', email: '', dob: '', gender: 'male', address: '' })
        loadPatients()
      }
    } catch (err) {
      alert('Lỗi thêm bệnh nhân!')
    }
  }

  // 4. Lưu thông tin bệnh nhân vừa sửa
  const handleUpdatePatient = async (e) => {
    e.preventDefault()
    try {
      const res = await api.put(`/patients/${editingPatient.id}`, editingPatient)
      if (res.data.success) {
        alert('Cập nhật bệnh nhân thành công!')
        setEditingPatient(null)
        loadPatients()
      }
    } catch (err) {
      alert('Lỗi cập nhật bệnh nhân!')
    }
  }

  // 5. Xóa bệnh nhân khỏi hệ thống
  const handleDeletePatient = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa bệnh nhân này?')) return
    try {
      const res = await api.delete(`/patients/${id}`)
      if (res.data.success) {
        alert('Xóa bệnh nhân thành công!')
        if (selectedPatient?.id === id) setSelectedPatient(null)
        loadPatients()
      }
    } catch (err) {
      alert('Lỗi xóa bệnh nhân!')
    }
  }

  // 6. Lưu ca khám răng điều trị mới
  const handleCreateTreatment = async (e) => {
    e.preventDefault()
    try {
      // Lọc lấy danh sách các thuốc đã được tích chọn
      const usedMaterials = availableMaterials
        .filter(m => m.checked)
        .map(m => {
          return {
            material_id: m.id,
            quantity_used: m.quantity_used
          }
        })

      const payload = {
        ...newTreatment,
        patient_id: selectedPatient.id,
        usedMaterials: usedMaterials
      }

      const res = await api.post('/treatments', payload)
      if (res.data.success) {
        alert('Tạo bệnh án thành công!')
        setShowTreatmentModal(false)
        setNewTreatment({
          treatment_date: new Date().toISOString().split('T')[0],
          tooth_number: '11',
          condition: 'decayed',
          total_cost: '',
          notes: '',
          signatureBase64: ''
        })
        loadTreatments(selectedPatient.id)
      }
    } catch (err) {
      alert('Lỗi tạo bệnh án!')
    }
  }

  // Danh hiệu 32 chiếc răng
  const teethList = [
    18,17,16,15,14,13,12,11, 21,22,23,24,25,26,27,28,
    48,47,46,45,44,43,42,41, 31,32,33,34,35,36,37,38
  ]

  // Bảng dịch bệnh lý
  const conditionLabels = {
    healthy: 'Răng khỏe mạnh',
    decayed: 'Sâu răng',
    missing: 'Đã nhổ răng',
    filled: 'Trám răng',
    crown: 'Bọc mão sứ',
    implant: 'Cấy ghép Implant'
  }

  // ==========================================
  // III. GIAO DIỆN HIỂN THỊ CHI TIẾT
  // ==========================================
  return (
    <div className="khung-trang-benh-nhan">
      
      {/* Tiêu đề trên cùng */}
      <div className="dong-tieu-de-tren-cung">
        <h2>Quản lý Bệnh nhân & Hồ sơ Bệnh án</h2>
        <button onClick={() => setShowAddModal(true)} className="nut-them-benh-nhan-moi">
          + Thêm Bệnh nhân mới
        </button>
      </div>

      {/* Khung chia cột: 2 cột nếu đang chọn xem bệnh nhân, 1 cột nếu chưa chọn */}
      <div className={`khung-chia-cot-benh-nhan ${selectedPatient ? 'chia-hai-cot' : 'mot-cot'}`}>
        
        {/* --- CỘT BÊN TRÁI: BẢNG DANH SÁCH BỆNH NHÂN --- */}
        <div className="khung-hop-benh-nhan">
          <h3>Danh sách Bệnh nhân ({patients.length})</h3>
          <table className="bang-danh-sach-benh-nhan">
            <thead>
              <tr className="dong-tieu-de-bang">
                <th className="o-tieu-de-cot">Họ tên</th>
                <th className="o-tieu-de-cot">SĐT</th>
                <th className="o-tieu-de-cot">Ngày sinh</th>
                <th className="o-tieu-de-cot">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {patients.map(p => {
                const isSelected = selectedPatient?.id === p.id
                return (
                  <tr key={p.id} className={`dong-thong-tin-benh-nhan ${isSelected ? 'dong-dang-duoc-chon' : ''}`}>
                    <td className="o-ho-ten-in-dam">{p.fullname}</td>
                    <td className="o-thong-tin-thuong">{p.phone}</td>
                    <td className="o-thong-tin-thuong">{new Date(p.dob).toLocaleDateString('vi-VN')}</td>
                    <td className="action-buttons">
                      
                      <button 
                        onClick={() => { setSelectedPatient(p); loadTreatments(p.id); }} 
                        className="nut-xem-benh-an"
                      >
                        Bệnh án
                      </button>

                      <button 
                        onClick={() => {
                          setEditingPatient({
                            ...p,
                            dob: p.dob ? p.dob.split('T')[0] : ''
                          })
                        }} 
                        className="nut-sua-thong-tin"
                      >
                        Sửa
                      </button>

                      <button onClick={() => handleDeletePatient(p.id)} className="nut-xoa-benh-nhan">
                        Xóa
                      </button>

                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* --- CỘT BÊN PHẢI: LỊST SỬ BỆNH ÁN CỦA BỆNH NHÂN ĐANG CHỌN --- */}
        {selectedPatient && (
          <div className="khung-hop-benh-nhan">
            <div className="dong-tieu-de-tren-cung">
              <h3>Lịch sử Bệnh án: {selectedPatient.fullname}</h3>
              <button onClick={() => setShowTreatmentModal(true)} className="nut-xem-benh-an">
                + Thêm Bệnh án
              </button>
            </div>

            <div style={{ marginTop: '15px' }}>
              {treatments.length === 0 ? (
                <p style={{ color: '#64748b' }}>Chưa có lịch sử điều trị nào.</p>
              ) : (
                treatments.map(t => (
                  <div key={t.id} className="khung-mot-ca-kham-cu">
                    
                    <div className="dong-tieu-de-ca-kham">
                      <span>Ngày khám: {new Date(t.treatment_date).toLocaleDateString('vi-VN')}</span>
                      <span>Chi phí: {Number(t.total_cost).toLocaleString('vi-VN')} VNĐ</span>
                    </div>
                    <div className="ten-bac-si-kham">Bác sĩ phụ trách: {t.doctor_name}</div>
                    
                    <div className="hop-chi-tiet-benh-ly">
                      <strong>Chi tiết điều trị:</strong>
                      {t.teeth?.map(item => (
                        <div key={item.id} className="dong-chi-tiet-rang-benh">
                          • <strong>Răng số {item.tooth_number}</strong>: <span style={{ color: '#d97706', fontWeight: 'bold' }}>{conditionLabels[item.condition] || item.condition}</span>
                        </div>
                      ))}
                      {t.notes && <div className="chu-ghi-chu-cua-bac-si">Ghi chú: {t.notes}</div>}
                    </div>

                    {t.signature_path && (
                      <div className="khung-hien-thi-chu-ky">
                        <span className="tieu-de-chu-ky">Chữ ký cam kết của bệnh nhân:</span> <br/>
                        <img 
                          src={`http://localhost:3000${t.signature_path}`} 
                          alt="Chữ ký bệnh nhân" 
                          className="hinh-anh-chu-ky-benh-nhan" 
                        />
                      </div>
                    )}

                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* --- HỘP THOẠI 1: FORM THÊM BỆNH NHÂN MỚI (Popup) --- */}
      {showAddModal && (
        <div className="nen-mo-hop-thoai-phu-man-hinh">
          <div className="than-hop-thoai-nho">
            <h3>Thêm Bệnh nhân mới</h3>
            <form onSubmit={handleCreatePatient} className="khung-nhap-doc">
              <input type="text" placeholder="Họ và tên *" value={newPatient.fullname} onChange={e => setNewPatient({...newPatient, fullname: e.target.value})} required className="o-nhap-chu" />
              <input type="text" placeholder="Số điện thoại *" value={newPatient.phone} onChange={e => setNewPatient({...newPatient, phone: e.target.value})} required className="o-nhap-chu" />
              <input type="email" placeholder="Email" value={newPatient.email} onChange={e => setNewPatient({...newPatient, email: e.target.value})} className="o-nhap-chu" />
              <input type="date" placeholder="Ngày sinh *" value={newPatient.dob} onChange={e => setNewPatient({...newPatient, dob: e.target.value})} required className="o-nhap-chu" />
              <select value={newPatient.gender} onChange={e => setNewPatient({...newPatient, gender: e.target.value})} className="o-chon-lua-drop-down">
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
              </select>
              <textarea placeholder="Địa chỉ" value={newPatient.address} onChange={e => setNewPatient({...newPatient, address: e.target.value})} className="o-nhap-chu-nhieu-dong" />
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="nut-huy-bo">Hủy</button>
                <button type="submit" className="nut-luu-lai">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- HỘP THOẠI 2: FORM SỬA THÔNG TIN BỆNH NHÂN (Popup) --- */}
      {editingPatient && (
        <div className="nen-mo-hop-thoai-phu-man-hinh">
          <div className="than-hop-thoai-nho">
            <h3>Sửa thông tin Bệnh nhân</h3>
            <form onSubmit={handleUpdatePatient} className="khung-nhap-doc">
              <input type="text" placeholder="Họ và tên *" value={editingPatient.fullname} onChange={e => setEditingPatient({...editingPatient, fullname: e.target.value})} required className="o-nhap-chu" />
              <input type="text" placeholder="Số điện thoại *" value={editingPatient.phone} onChange={e => setEditingPatient({...editingPatient, phone: e.target.value})} required className="o-nhap-chu" />
              <input type="email" placeholder="Email" value={editingPatient.email || ''} onChange={e => setEditingPatient({...editingPatient, email: e.target.value})} className="o-nhap-chu" />
              <input type="date" placeholder="Ngày sinh *" value={editingPatient.dob} onChange={e => setEditingPatient({...editingPatient, dob: e.target.value})} required className="o-nhap-chu" />
              <select value={editingPatient.gender} onChange={e => setEditingPatient({...editingPatient, gender: e.target.value})} className="o-chon-lua-drop-down">
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
              </select>
              <textarea placeholder="Địa chỉ" value={editingPatient.address || ''} onChange={e => setEditingPatient({...editingPatient, address: e.target.value})} className="o-nhap-chu-nhieu-dong" />
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setEditingPatient(null)} className="nut-huy-bo">Hủy</button>
                <button type="submit" className="nut-cap-nhat">Cập nhật</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- HỘP THOẠI 3: FORM THÊM BỆNH ÁN KHÁM ĐIỀU TRỊ MỚI (Popup) --- */}
      {showTreatmentModal && (
        <div className="nen-mo-hop-thoai-phu-man-hinh">
          <div className="than-hop-thoai-to">
            <h3>Tạo hồ sơ Bệnh án điều trị mới</h3>
            <form onSubmit={handleCreateTreatment} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              
              {/* Chọn Ngày khám */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Ngày điều trị</label>
                <input type="date" value={newTreatment.treatment_date} onChange={e => setNewTreatment({...newTreatment, treatment_date: e.target.value})} required className="o-nhap-chu" />
              </div>
              
              {/* Chọn Răng và Bệnh lý */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Chọn Răng điều trị</label>
                  <select value={newTreatment.tooth_number} onChange={e => setNewTreatment({...newTreatment, tooth_number: e.target.value})} className="o-chon-lua-drop-down">
                    {teethList.map(t => (
                      <option key={t} value={t}>Răng {t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Bệnh lý / Thủ thuật</label>
                  <select value={newTreatment.condition} onChange={e => setNewTreatment({...newTreatment, condition: e.target.value})} className="o-chon-lua-drop-down">
                    <option value="decayed">Sâu răng</option>
                    <option value="missing">Đã nhổ răng</option>
                    <option value="filled">Trám răng</option>
                    <option value="crown">Bọc mão sứ</option>
                    <option value="implant">Cấy ghép Implant</option>
                  </select>
                </div>
              </div>

              {/* Chi phí */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Tổng chi phí điều trị (VNĐ)</label>
                <input type="number" placeholder="Ví dụ: 2000000" value={newTreatment.total_cost} onChange={e => setNewTreatment({...newTreatment, total_cost: e.target.value})} required className="o-nhap-chu" />
              </div>

              {/* Tích chọn Vật tư kho */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Vật tư tiêu hao sử dụng</label>
                <div className="hop-chua-danh-sach-thuoc">
                  {availableMaterials.length === 0 ? (
                    <span style={{ fontSize: '13px', color: '#64748b' }}>Không tìm thấy vật tư trong kho.</span>
                  ) : (
                    availableMaterials.map((m, idx) => (
                      <div key={m.id} className="dong-mot-loai-thuoc">
                        
                        <label className="chu-tich-chon-thuoc">
                          <input 
                            type="checkbox" 
                            checked={m.checked} 
                            onChange={e => {
                              const updated = [...availableMaterials]
                              updated[idx].checked = e.target.checked
                              setAvailableMaterials(updated)
                            }}
                          />
                          {m.name} ({m.unit})
                        </label>
                        
                        {m.checked && (
                          <input 
                            type="number" 
                            min="1" 
                            max={m.quantity}
                            value={m.quantity_used}
                            onChange={e => {
                              const updated = [...availableMaterials]
                              updated[idx].quantity_used = Number(e.target.value)
                              setAvailableMaterials(updated)
                            }}
                            className="o-nhap-so-luong-thuoc-dung"
                          />
                        )}

                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Ghi chú bệnh án */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Ghi chú điều trị</label>
                <textarea rows="2" placeholder="Tình trạng răng miệng..." value={newTreatment.notes} onChange={e => setNewTreatment({...newTreatment, notes: e.target.value})} className="o-nhap-chu-nhieu-dong" />
              </div>

              {/* Vẽ ký chữ ký tươi */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Chữ ký cam kết của bệnh nhân (Vẽ bằng chuột/tay)</label>
                <div className="hop-chua-bang-ve-chu-ky">
                  <SignaturePad onSave={(base64) => setNewTreatment({...newTreatment, signatureBase64: base64})} />
                </div>
              </div>

              {/* Nút hủy và nút lưu */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowTreatmentModal(false)} className="nut-huy-bo">Hủy</button>
                <button type="submit" className="nut-cap-nhat">Lưu bệnh án</button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Patients
