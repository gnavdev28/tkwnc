import React, { useState, useEffect } from 'react'
import api from '../api'
import '../css/Inventory.css'

function Inventory() {
  const [materials, setMaterials] = useState([])
  const [editingMaterial, setEditingMaterial] = useState(null)
  const [editQty, setEditQty] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newMaterial, setNewMaterial] = useState({
    name: '',
    unit: '',
    quantity: '',
    min_quantity: ''
  })

  useEffect(() => {
    loadInventory()
  }, [])

  const loadInventory = async () => {
    try {
      const res = await api.get('/inventory')
      if (res.data.success) {
        setMaterials(res.data.materials)
      }
    } catch (err) {
      alert('Lỗi tải kho vật tư y tế!')
    }
  }

  const handleUpdateStock = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        name: editingMaterial.name,
        unit: editingMaterial.unit,
        quantity: Number(editQty),
        min_quantity: editingMaterial.min_quantity
      }
      const res = await api.put(`/inventory/${editingMaterial.id}`, payload)
      if (res.data.success) {
        alert('Cập nhật kho vật tư thành công!')
        setEditingMaterial(null)
        loadInventory()
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi cập nhật kho vật tư!')
    }
  }

  const handleCreateMaterial = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        name: newMaterial.name,
        unit: newMaterial.unit,
        quantity: Number(newMaterial.quantity),
        min_quantity: Number(newMaterial.min_quantity)
      }
      const res = await api.post('/inventory', payload)
      if (res.data.success) {
        alert('Thêm vật tư y tế mới thành công!')
        setShowAddModal(false)
        setNewMaterial({ name: '', unit: '', quantity: '', min_quantity: '' })
        loadInventory()
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi thêm vật tư mới!')
    }
  }

  return (
    <div className="khung-kho-vat-tu">
      <div className="tieu-de-kho">
        <div>
          <h2 className="tieu-de-kho-text">Quản lý Kho vật tư tiêu hao</h2>
          <p className="tieu-de-kho-desc">Theo dõi số lượng thuốc, kim tiêm, vật tư nha khoa thực tế</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="nut-them-vat-tu">
          + Thêm vật tư mới
        </button>
      </div>

      <div className="the-bang-kho">
        <table className="bang-ke-kho">
          <thead>
            <tr className="dong-tieu-de-kho">
              <th className="o-tieu-de-kho">Mã vật tư</th>
              <th className="o-tieu-de-kho">Tên vật tư y tế</th>
              <th className="o-tieu-de-kho">Đơn vị tính</th>
              <th className="o-tieu-de-kho" style={{ textAlign: 'center' }}>Số lượng tồn</th>
              <th className="o-tieu-de-kho" style={{ textAlign: 'center' }}>Ngưỡng tối thiểu</th>
              <th className="o-tieu-de-kho" style={{ textAlign: 'center' }}>Trạng thái</th>
              <th className="o-tieu-de-kho" style={{ textAlign: 'center' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {materials.map(m => {
              const isLowStock = m.quantity <= m.min_quantity
              return (
                <tr key={m.id} className={`dong-thuoc-trong-kho ${isLowStock ? 'dong-thuoc-sieu-canh-bao' : ''}`}>
                  <td className="o-du-lieu-thuoc-xam">#{m.id}</td>
                  <td className="o-du-lieu-in-dam">{m.name}</td>
                  <td className="o-du-lieu-thuoc">{m.unit}</td>
                  <td className="o-du-lieu-giua-dam">{m.quantity}</td>
                  <td className="o-du-lieu-giua" style={{ color: '#64748b' }}>{m.min_quantity}</td>
                  <td className="o-du-lieu-giua">
                    {isLowStock ? (
                      <span className="nhan-trang-thai-loi">
                        CẦN NHẬP KHO
                      </span>
                    ) : (
                      <span className="nhan-trang-thai-an-toan">
                        An toàn
                      </span>
                    )}
                  </td>
                  <td className="o-du-lieu-giua">
                    <button 
                      onClick={() => { setEditingMaterial(m); setEditQty(m.quantity); }}
                      className="nut-sua-kho"
                    >
                      Nhập/Sửa kho
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="nen-overlay-popup">
          <div className="hop-popup-nho">
            <h3 style={{ margin: '0 0 15px 0', color: '#1e3a8a' }}>Thêm vật tư y tế mới</h3>
            <form onSubmit={handleCreateMaterial} className="form-popup-doc">
              <div className="dong-nhap-lieu-don">
                <label className="nhan-dien-o-nhap">Tên vật tư</label>
                <input 
                  type="text" 
                  value={newMaterial.name} 
                  onChange={e => setNewMaterial({ ...newMaterial, name: e.target.value })} 
                  required 
                  className="o-o-nhap-kho" 
                />
              </div>
              <div className="dong-nhap-lieu-don">
                <label className="nhan-dien-o-nhap">Đơn vị tính</label>
                <input 
                  type="text" 
                  value={newMaterial.unit} 
                  onChange={e => setNewMaterial({ ...newMaterial, unit: e.target.value })} 
                  required 
                  className="o-o-nhap-kho" 
                />
              </div>
              <div className="dong-nhap-lieu-don">
                <label className="nhan-dien-o-nhap">Số lượng ban đầu</label>
                <input 
                  type="number" 
                  value={newMaterial.quantity} 
                  onChange={e => setNewMaterial({ ...newMaterial, quantity: e.target.value })} 
                  required 
                  className="o-o-nhap-kho" 
                />
              </div>
              <div className="dong-nhap-lieu-don">
                <label className="nhan-dien-o-nhap">Ngưỡng tối thiểu</label>
                <input 
                  type="number" 
                  value={newMaterial.min_quantity} 
                  onChange={e => setNewMaterial({ ...newMaterial, min_quantity: e.target.value })} 
                  required 
                  className="o-o-nhap-kho" 
                />
              </div>
              <div className="o-nut-bam-popup">
                <button type="button" onClick={() => setShowAddModal(false)} className="nut-bam-huy">Hủy</button>
                <button type="submit" className="nut-bam-them-moi">Thêm mới</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingMaterial && (
        <div className="nen-overlay-popup">
          <div className="hop-popup-nho-sieu-nho">
            <h3 style={{ margin: '0 0 15px 0', color: '#1e3a8a' }}>Nhập/Sửa số lượng kho</h3>
            <p style={{ fontSize: '14px', color: '#475569', margin: '0 0 15px 0' }}>
              Thay đổi số lượng cho vật tư: <strong>{editingMaterial.name}</strong> ({editingMaterial.unit})
            </p>
            <form onSubmit={handleUpdateStock} className="form-popup-doc">
              <div className="dong-nhap-lieu-don">
                <label className="nhan-dien-o-nhap">Số lượng mới</label>
                <input 
                  type="number" 
                  value={editQty} 
                  onChange={e => setEditQty(e.target.value)} 
                  required 
                  className="o-o-nhap-kho" 
                />
              </div>
              <div className="o-nut-bam-popup">
                <button type="button" onClick={() => setEditingMaterial(null)} className="nut-bam-huy">Hủy</button>
                <button type="submit" className="nut-bam-cap-nhat">Cập nhật</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Inventory
