import React, { useState, useEffect } from 'react'
import api from '../api'
import AddPatientModal from '../components/AddPatientModal.jsx'
import EditPatientModal from '../components/EditPatientModal.jsx'
import AddTreatmentModal from '../components/AddTreatmentModal.jsx'
import '../css/Patients.css'

function Patients() {
  const [patients, setPatients] = useState([])
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [treatments, setTreatments] = useState([])
  
  const [showAddModal, setShowAddModal] = useState(false)
  const [showTreatmentModal, setShowTreatmentModal] = useState(false)
  const [editingPatient, setEditingPatient] = useState(null)

  // Tải danh sách bệnh nhân khi bắt đầu mở trang
  useEffect(function() {
    loadPatients()
  }, [])

  // 1. Tải danh sách bệnh nhân từ server
  async function loadPatients() {
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
  async function loadTreatments(patientId) {
    try {
      const res = await api.get(`/treatments/patient/${patientId}`)
      if (res.data.success) {
        setTreatments(res.data.treatments)
      }
    } catch (err) {
      alert('Lỗi tải lịch sử bệnh án!')
    }
  }

  // 3. Tạo bệnh nhân mới từ component con AddPatientModal
  async function handleCreatePatient(patientData) {
    try {
      const res = await api.post('/patients', patientData)
      if (res.data.success) {
        alert('Thêm bệnh nhân thành công!')
        setShowAddModal(false)
        loadPatients()
      }
    } catch (err) {
      alert('Lỗi thêm bệnh nhân!')
    }
  }

  // 4. Lưu thông tin bệnh nhân vừa sửa từ component con EditPatientModal
  async function handleUpdatePatient(updatedData) {
    try {
      const res = await api.put(`/patients/${updatedData.id}`, updatedData)
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
  async function handleDeletePatient(id) {
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

  // 6. Tạo hồ sơ bệnh án điều trị mới từ component con AddTreatmentModal
  async function handleCreateTreatment(treatmentData) {
    try {
      const payload = {
        ...treatmentData,
        patient_id: selectedPatient.id
      }
      const res = await api.post('/treatments', payload)
      if (res.data.success) {
        alert('Tạo bệnh án thành công!')
        setShowTreatmentModal(false)
        loadTreatments(selectedPatient.id)
      }
    } catch (err) {
      alert('Lỗi tạo bệnh án!')
    }
  }

  const conditionLabels = {
    healthy: 'Răng khỏe mạnh',
    decayed: 'Sâu răng',
    missing: 'Đã nhổ răng',
    filled: 'Trám răng',
    crown: 'Bọc mão sứ',
    implant: 'Cấy ghép Implant'
  }

  return (
    <div className="khung-trang-benh-nhan">
      <div className="dong-tieu-de-tren-cung">
        <h2>Quản lý Bệnh nhân & Hồ sơ Bệnh án</h2>
        <button onClick={function() { setShowAddModal(true) }} className="nut-them-benh-nhan-moi">
          + Thêm Bệnh nhân mới
        </button>
      </div>

      <div className={`khung-chia-cot-benh-nhan ${selectedPatient ? 'chia-hai-cot' : 'mot-cot'}`}>
        <div className="khung-hop-benh-nhan">
          <h3>Danh sách Bệnh nhân ({patients.length})</h3>
          
          <div className="danh-sach-benh-nhan-cards">
            {patients.map(function(p) {
              const isSelected = selectedPatient?.id === p.id
              return (
                <div key={p.id} className={`hop-benh-nhan-item ${isSelected ? 'benh-nhan-dang-chon' : ''}`}>
                  <div className="benh-nhan-tieu-de">
                    <strong className="ten-benh-nhan-lon">{p.fullname}</strong>
                    <span className="sdt-benh-nhan">SĐT: {p.phone}</span>
                  </div>
                  
                  <div className="benh-nhan-phu">
                    <span>Ngày sinh: {new Date(p.dob).toLocaleDateString('vi-VN')}</span>
                  </div>

                  <div className="benh-nhan-thao-tac">
                    <button 
                      onClick={function() { setSelectedPatient(p); loadTreatments(p.id); }} 
                      className="nut-xem-benh-an"
                    >
                      Bệnh án
                    </button>

                    <button 
                      onClick={function() { setEditingPatient(p) }} 
                      className="nut-sua-thong-tin"
                    >
                      Sửa
                    </button>

                    <button onClick={function() { handleDeletePatient(p.id) }} className="nut-xoa-benh-nhan">
                      Xóa
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {selectedPatient && (
          <div className="khung-hop-benh-nhan">
            <div className="dong-tieu-de-tren-cung">
              <h3>Lịch sử Bệnh án: {selectedPatient.fullname}</h3>
              <button onClick={function() { setShowTreatmentModal(true) }} className="nut-xem-benh-an">
                + Thêm Bệnh án
              </button>
            </div>

            <div style={{ marginTop: '15px' }}>
              {treatments.length === 0 ? (
                <p style={{ color: '#64748b' }}>Chưa có lịch sử điều trị nào.</p>
              ) : (
                treatments.map(function(t) {
                  return (
                    <div key={t.id} className="khung-mot-ca-kham-cu">
                      <div className="dong-tieu-de-ca-kham">
                        <span>Ngày khám: {new Date(t.treatment_date).toLocaleDateString('vi-VN')}</span>
                        <span>Chi phí: {Number(t.total_cost).toLocaleString('vi-VN')} VNĐ</span>
                      </div>
                      <div className="ten-bac-si-kham">Bác sĩ phụ trách: {t.doctor_name}</div>
                      
                      <div className="hop-chi-tiet-benh-ly">
                        <strong>Chi tiết điều trị:</strong>
                        {t.teeth?.map(function(item) {
                          return (
                            <div key={item.id} className="dong-chi-tiet-rang-benh">
                              • <strong>Răng số {item.tooth_number}</strong>: <span style={{ color: '#d97706', fontWeight: 'bold' }}>{conditionLabels[item.condition] || item.condition}</span>
                            </div>
                          )
                        })}
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
                  )
                })
              )}
            </div>
          </div>
        )}
      </div>

      {showAddModal && (
        <AddPatientModal
          onClose={function() { setShowAddModal(false) }}
          onSubmit={handleCreatePatient}
        />
      )}

      {editingPatient && (
        <EditPatientModal
          patient={editingPatient}
          onClose={function() { setEditingPatient(null) }}
          onSubmit={handleUpdatePatient}
        />
      )}

      {showTreatmentModal && (
        <AddTreatmentModal
          patientName={selectedPatient?.fullname}
          onClose={function() { setShowTreatmentModal(false) }}
          onSubmit={handleCreateTreatment}
        />
      )}
    </div>
  )
}

export default Patients
