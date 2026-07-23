import React, { useState, useEffect } from 'react'
import api from '../api'
import SignaturePad from '../components/SignaturePad'

function Patients() {
  const [patients, setPatients] = useState([])
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [treatments, setTreatments] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [showTreatmentModal, setShowTreatmentModal] = useState(false)
  const [editingPatient, setEditingPatient] = useState(null)
  const [availableMaterials, setAvailableMaterials] = useState([])

  const [newPatient, setNewPatient] = useState({
    fullname: '',
    phone: '',
    email: '',
    dob: '',
    gender: 'male',
    address: ''
  })

  const [newTreatment, setNewTreatment] = useState({
    treatment_date: new Date().toISOString().split('T')[0],
    tooth_number: '11',
    condition: 'decayed',
    total_cost: '',
    notes: '',
    signatureBase64: ''
  })

  useEffect(() => {
    loadPatients()
  }, [])

  useEffect(() => {
    if (showTreatmentModal) {
      api.get('/inventory')
        .then(res => {
          if (res.data.success) {
            setAvailableMaterials(res.data.materials.map(m => ({ ...m, checked: false, quantity_used: 1 })))
          }
        })
        .catch(err => console.error(err))
    }
  }, [showTreatmentModal])

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

  const handleCreateTreatment = async (e) => {
    e.preventDefault()
    try {
      const usedMaterials = availableMaterials
        .filter(m => m.checked)
        .map(m => ({
          material_id: m.id,
          quantity_used: m.quantity_used
        }))

      const payload = {
        ...newTreatment,
        patient_id: selectedPatient.id,
        usedMaterials
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
        <h2>Quản lý Bệnh nhân & Hồ sơ Bệnh án</h2>
        <button 
          onClick={() => setShowAddModal(true)} 
          style={{ padding: '10px 15px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          + Thêm Bệnh nhân mới
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedPatient ? '1fr 1fr' : '1fr', gap: '20px' }}>
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
                      onClick={() => {
                        setEditingPatient({
                          ...p,
                          dob: p.dob ? p.dob.split('T')[0] : ''
                        })
                      }} 
                      style={{ padding: '4px 8px', backgroundColor: '#e2e8f0', color: '#1e293b', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                    >
                      Sửa
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
                    
                    <div style={{ marginTop: '10px', backgroundColor: 'white', padding: '10px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                      <strong>Chi tiết điều trị:</strong>
                      {t.teeth?.map(item => (
                        <div key={item.id} style={{ fontSize: '14px', marginTop: '5px' }}>
                          • <strong>Răng số {item.tooth_number}</strong>: <span style={{ color: '#d97706', fontWeight: 'bold' }}>{conditionLabels[item.condition] || item.condition}</span>
                        </div>
                      ))}
                      {t.notes && <div style={{ fontSize: '13px', fontStyle: 'italic', marginTop: '5px' }}>Ghi chú: {t.notes}</div>}
                    </div>

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

      {editingPatient && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '8px', width: '400px' }}>
            <h3>Sửa thông tin Bệnh nhân</h3>
            <form onSubmit={handleUpdatePatient} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input type="text" placeholder="Họ và tên *" value={editingPatient.fullname} onChange={e => setEditingPatient({...editingPatient, fullname: e.target.value})} required style={{ padding: '8px' }} />
              <input type="text" placeholder="Số điện thoại *" value={editingPatient.phone} onChange={e => setEditingPatient({...editingPatient, phone: e.target.value})} required style={{ padding: '8px' }} />
              <input type="email" placeholder="Email" value={editingPatient.email || ''} onChange={e => setEditingPatient({...editingPatient, email: e.target.value})} style={{ padding: '8px' }} />
              <input type="date" placeholder="Ngày sinh *" value={editingPatient.dob} onChange={e => setEditingPatient({...editingPatient, dob: e.target.value})} required style={{ padding: '8px' }} />
              <select value={editingPatient.gender} onChange={e => setEditingPatient({...editingPatient, gender: e.target.value})} style={{ padding: '8px' }}>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
              </select>
              <textarea placeholder="Địa chỉ" value={editingPatient.address || ''} onChange={e => setEditingPatient({...editingPatient, address: e.target.value})} style={{ padding: '8px' }} />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setEditingPatient(null)} style={{ padding: '8px 15px' }}>Hủy</button>
                <button type="submit" style={{ padding: '8px 15px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px' }}>Cập nhật</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTreatmentModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '8px', width: '550px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3>Tạo hồ sơ Bệnh án điều trị mới</h3>
            <form onSubmit={handleCreateTreatment} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Ngày điều trị</label>
                <input type="date" value={newTreatment.treatment_date} onChange={e => setNewTreatment({...newTreatment, treatment_date: e.target.value})} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Chọn Răng điều trị</label>
                  <select value={newTreatment.tooth_number} onChange={e => setNewTreatment({...newTreatment, tooth_number: e.target.value})} style={{ width: '100%', padding: '8px' }}>
                    {teethList.map(t => (
                      <option key={t} value={t}>Răng {t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Bệnh lý / Thủ thuật</label>
                  <select value={newTreatment.condition} onChange={e => setNewTreatment({...newTreatment, condition: e.target.value})} style={{ width: '100%', padding: '8px' }}>
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
                <input type="number" placeholder="Ví dụ: 2000000" value={newTreatment.total_cost} onChange={e => setNewTreatment({...newTreatment, total_cost: e.target.value})} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Vật tư tiêu hao sử dụng</label>
                <div style={{ border: '1px solid #cbd5e1', borderRadius: '4px', padding: '10px', maxHeight: '120px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {availableMaterials.length === 0 ? (
                    <span style={{ fontSize: '13px', color: '#64748b' }}>Không tìm thấy vật tư trong kho.</span>
                  ) : (
                    availableMaterials.map((m, idx) => (
                      <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label style={{ fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
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
                            style={{ width: '60px', padding: '3px', fontSize: '12px' }}
                          />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Ghi chú điều trị</label>
                <textarea rows="2" placeholder="Tình trạng răng miệng..." value={newTreatment.notes} onChange={e => setNewTreatment({...newTreatment, notes: e.target.value})} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Chữ ký cam kết của bệnh nhân (Vẽ bằng chuột/tay)</label>
                <div style={{ border: '1px solid #cbd5e1', borderRadius: '4px', backgroundColor: '#f8fafc' }}>
                  <SignaturePad onSave={(base64) => setNewTreatment({...newTreatment, signatureBase64: base64})} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowTreatmentModal(false)} style={{ padding: '10px 18px' }}>Hủy</button>
                <button type="submit" style={{ padding: '10px 18px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}>Lưu bệnh án</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Patients
