import React, { useState, useEffect } from 'react'
import api from '../api'
import SignaturePad from '../components/SignaturePad'

function Patients() {
  const [patients, setPatients] = useState([])
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [treatments, setTreatments] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [showTreatmentModal, setShowTreatmentModal] = useState(false)

  // Form state cho thêm bệnh nhân mới
  const [newPatient, setNewPatient] = useState({
    fullname: '',
    phone: '',
    email: '',
    dob: '',
    gender: 'male',
    address: ''
  })

  // Form state cho tạo bệnh án mới
  const [newTreatment, setNewTreatment] = useState({
    treatment_date: new Date().toISOString().split('T')[0],
    tooth_number: '11',
    condition: 'decayed',
    total_cost: '',
    notes: '',
    signatureBase64: ''
  })

  // Tải danh sách bệnh nhân từ backend
  useEffect(() => {
    loadPatients()
  }, [])

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

  // Tải lịch sử bệnh án khi chọn một bệnh nhân
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

  // Xử lý tạo bệnh nhân mới
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

  // Xử lý xóa bệnh nhân
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

  // Xử lý tạo bệnh án mới
  const handleCreateTreatment = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        ...newTreatment,
        patient_id: selectedPatient.id
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

  // Danh sách 32 răng chuẩn y khoa
  const teethList = [
    18,17,16,15,14,13,12,11, 21,22,23,24,25,26,27,28,
    48,47,46,45,44,43,42,41, 31,32,33,34,35,36,37,38
  ]

  const conditionLabels = {
    healthy: 'Răng khỏe mạnh',
    decayed: 'Sâu răng',
    missing: 'Đã nhổ răng',
    filled: 'Trám răng',
    crown: 'Bọc mão sứ',
    implant: 'Cấy ghép Implant'
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>📋 Quản lý Bệnh nhân & Hồ sơ Bệnh án</h2>
        <button 
          onClick={() => setShowAddModal(true)} 
          style={{ padding: '10px 15px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          + Thêm Bệnh nhân mới
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedPatient ? '1fr 1fr' : '1fr', gap: '20px' }}>
        {/* Cột 1: Danh sách Bệnh nhân */}
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <h3>Danh sách Bệnh nhân ({patients.length})</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9', textAlign: 'left' }}>
                <th style={{ padding: '10px', borderBottom: '1px solid #cbd5e1' }}>Họ tên</th>
                <th style={{ padding: '10px', borderBottom: '1px solid #cbd5e1' }}>SĐT</th>
                <th style={{ padding: '10px', borderBottom: '1px solid #cbd5e1' }}>Ngày sinh</th>
                <th style={{ padding: '10px', borderBottom: '1px solid #cbd5e1' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {patients.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: selectedPatient?.id === p.id ? '#eff6ff' : 'transparent' }}>
                  <td style={{ padding: '10px', fontWeight: 'bold' }}>{p.fullname}</td>
                  <td style={{ padding: '10px' }}>{p.phone}</td>
                  <td style={{ padding: '10px' }}>{new Date(p.dob).toLocaleDateString('vi-VN')}</td>
                  <td style={{ padding: '10px', display: 'flex', gap: '5px' }}>
                    <button 
                      onClick={() => { setSelectedPatient(p); loadTreatments(p.id); }} 
                      style={{ padding: '4px 8px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                    >
                      Bệnh án
                    </button>
                    <button 
                      onClick={() => handleDeletePatient(p.id)} 
                      style={{ padding: '4px 8px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Cột 2: Chi tiết Bệnh án của Bệnh nhân được chọn */}
        {selectedPatient && (
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>Lịch sử Bệnh án: {selectedPatient.fullname}</h3>
              <button 
                onClick={() => setShowTreatmentModal(true)} 
                style={{ padding: '8px 12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}
              >
                + Thêm Bệnh án
              </button>
            </div>

            <div style={{ marginTop: '15px' }}>
              {treatments.length === 0 ? (
                <p style={{ color: '#64748b' }}>Chưa có lịch sử điều trị nào.</p>
              ) : (
                treatments.map(t => (
                  <div key={t.id} style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '15px', marginBottom: '15px', backgroundColor: '#f8fafc' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: '#1e3a8a' }}>
                      <span>Ngày khám: {new Date(t.treatment_date).toLocaleDateString('vi-VN')}</span>
                      <span>Chi phí: {Number(t.total_cost).toLocaleString('vi-VN')} VNĐ</span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Bác sĩ phụ trách: {t.doctor_name}</div>
                    
                    {/* Chi tiết răng */}
                    <div style={{ marginTop: '10px', backgroundColor: 'white', padding: '10px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                      <strong>Chi tiết điều trị:</strong>
                      {t.teeth?.map(item => (
                        <div key={item.id} style={{ fontSize: '14px', marginTop: '5px' }}>
                          • <strong>Răng số {item.tooth_number}</strong>: <span style={{ color: '#d97706', fontWeight: 'bold' }}>{conditionLabels[item.condition] || item.condition}</span>
                        </div>
                      ))}
                      {t.notes && <div style={{ fontSize: '13px', fontStyle: 'italic', marginTop: '5px' }}>Ghi chú: {t.notes}</div>}
                    </div>

                    {/* Hiển thị Chữ ký điện tử nếu có */}
                    {t.signature_path && (
                      <div style={{ marginTop: '10px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>Chữ ký cam kết của bệnh nhân:</span> <br/>
                        <img 
                          src={`http://localhost:3000${t.signature_path}`} 
                          alt="Chữ ký" 
                          style={{ maxHeight: '60px', border: '1px solid #cbd5e1', borderRadius: '4px', marginTop: '4px', backgroundColor: 'white' }} 
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

      {/* Modal Thêm Bệnh Nhân mới */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '8px', width: '400px' }}>
            <h3>Thêm Bệnh nhân mới</h3>
            <form onSubmit={handleCreatePatient} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input type="text" placeholder="Họ và tên *" value={newPatient.fullname} onChange={e => setNewPatient({...newPatient, fullname: e.target.value})} required style={{ padding: '8px' }} />
              <input type="text" placeholder="Số điện thoại *" value={newPatient.phone} onChange={e => setNewPatient({...newPatient, phone: e.target.value})} required style={{ padding: '8px' }} />
              <input type="email" placeholder="Email" value={newPatient.email} onChange={e => setNewPatient({...newPatient, email: e.target.value})} style={{ padding: '8px' }} />
              <input type="date" placeholder="Ngày sinh *" value={newPatient.dob} onChange={e => setNewPatient({...newPatient, dob: e.target.value})} required style={{ padding: '8px' }} />
              <select value={newPatient.gender} onChange={e => setNewPatient({...newPatient, gender: e.target.value})} style={{ padding: '8px' }}>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
              </select>
              <textarea placeholder="Địa chỉ" value={newPatient.address} onChange={e => setNewPatient({...newPatient, address: e.target.value})} style={{ padding: '8px' }} />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ padding: '8px 15px' }}>Hủy</button>
                <button type="submit" style={{ padding: '8px 15px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px' }}>Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Thêm Ca Điều Trị (Bệnh án) mới */}
      {showTreatmentModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '8px', width: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3>Tạo Hồ sơ Bệnh án mới: {selectedPatient?.fullname}</h3>
            <form onSubmit={handleCreateTreatment} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Ngày khám *</label>
                <input type="date" value={newTreatment.treatment_date} onChange={e => setNewTreatment({...newTreatment, treatment_date: e.target.value})} required style={{ width: '100%', padding: '8px', marginTop: '4px' }} />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Số hiệu răng *</label>
                <select value={newTreatment.tooth_number} onChange={e => setNewTreatment({...newTreatment, tooth_number: e.target.value})} style={{ width: '100%', padding: '8px', marginTop: '4px' }}>
                  {teethList.map(num => (
                    <option key={num} value={num}>Răng số {num}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Tình trạng điều trị *</label>
                <select value={newTreatment.condition} onChange={e => setNewTreatment({...newTreatment, condition: e.target.value})} style={{ width: '100%', padding: '8px', marginTop: '4px' }}>
                  <option value="decayed">Sâu răng</option>
                  <option value="filled">Trám răng</option>
                  <option value="missing">Đã nhổ răng</option>
                  <option value="crown">Bọc mão sứ</option>
                  <option value="implant">Cấy ghép Implant</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Chi phí điều trị (VNĐ)</label>
                <input type="number" placeholder="0" value={newTreatment.total_cost} onChange={e => setNewTreatment({...newTreatment, total_cost: e.target.value})} style={{ width: '100%', padding: '8px', marginTop: '4px' }} />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Ghi chú điều trị</label>
                <textarea value={newTreatment.notes} onChange={e => setNewTreatment({...newTreatment, notes: e.target.value})} style={{ width: '100%', padding: '8px', marginTop: '4px' }} />
              </div>

              {/* Tích hợp Component Bảng vẽ Chữ ký điện tử Canvas */}
              <SignaturePad onSaveSignature={base64 => setNewTreatment({...newTreatment, signatureBase64: base64})} />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px' }}>
                <button type="button" onClick={() => setShowTreatmentModal(false)} style={{ padding: '8px 15px' }}>Hủy</button>
                <button type="submit" style={{ padding: '8px 15px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}>Lưu Bệnh án</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Patients
