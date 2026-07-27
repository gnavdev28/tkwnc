import React, { useState, useEffect } from 'react'
import api from '../api'
import AddMaterialModal from '../components/AddMaterialModal.jsx'
import EditMaterialModal from '../components/EditMaterialModal.jsx'
import '../css/Inventory.css'

function Inventory() {
  const [materials, setMaterials] = useState([])
  const [editingMaterial, setEditingMaterial] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)

  // Tải danh sách vật tư khi mở trang
  useEffect(function() {
    loadInventory()
  }, [])

  // Hàm tải dữ liệu vật tư
  async function loadInventory() {
    try {
      const res = await api.get('/inventory')
      if (res.data.success) {
        setMaterials(res.data.materials)
      }
    } catch (err) {
      alert('Lỗi tải kho vật tư y tế!')
    }
  }

  // Hàm xử lý sửa tồn kho từ component con EditMaterialModal
  async function handleUpdateStock(newQty) {
    try {
      const payload = {
        name: editingMaterial.name,
        unit: editingMaterial.unit,
        quantity: newQty,
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

  // Hàm xử lý thêm vật tư mới từ component con AddMaterialModal
  async function handleCreateMaterial(materialData) {
    try {
      const res = await api.post('/inventory', materialData)
      if (res.data.success) {
        alert('Thêm vật tư y tế mới thành công!')
        setShowAddModal(false)
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
        <button onClick={function() { setShowAddModal(true) }} className="nut-them-vat-tu">
          + Thêm vật tư mới
        </button>
      </div>

      {/* Danh sách vật tư dạng hộp (Card List) */}
      <div className="hop-danh-sach-vat-tu">
        {materials.map(function(m) {
          const isLowStock = m.quantity <= m.min_quantity
          
          let nhanTrangThai
          if (isLowStock) {
            nhanTrangThai = <span className="the-canh-bao-kho">CẦN NHẬP KHO</span>
          } else {
            nhanTrangThai = <span className="the-an-toan-kho">An toàn</span>
          }

          return (
            <div key={m.id} className={`hop-vat-tu-item ${isLowStock ? 'vat-tu-sap-het' : ''}`}>
              <div className="thong-tin-co-ban">
                <span className="nhan-id-vat-tu">#{m.id}</span>
                <span className="ten-vat-tu-dam">{m.name}</span>
                <span className="don-vi-tinh">Đơn vị: {m.unit}</span>
              </div>
              
              <div className="thong-tin-ton-kho">
                <span>Tồn kho: <strong>{m.quantity}</strong></span>
                <span className="nguong-canh-bao-so">Cảnh báo khi dưới: {m.min_quantity}</span>
              </div>

              <div className="nut-va-trang-thai">
                {nhanTrangThai}
                <button 
                  onClick={function() { setEditingMaterial(m) }}
                  className="nut-sua-kho"
                >
                  Nhập/Sửa kho
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {showAddModal && (
        <AddMaterialModal
          onClose={function() { setShowAddModal(false) }}
          onSubmit={handleCreateMaterial}
        />
      )}

      {editingMaterial && (
        <EditMaterialModal
          material={editingMaterial}
          onClose={function() { setEditingMaterial(null) }}
          onSubmit={handleUpdateStock}
        />
      )}
    </div>
  )
}

export default Inventory
