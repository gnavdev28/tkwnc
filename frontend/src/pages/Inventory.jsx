import React, { useState, useEffect } from 'react'
import api from '../api'

function Inventory() {
  const [materials, setMaterials] = useState([])
  const [editingMaterial, setEditingMaterial] = useState(null)
  const [editQty, setEditQty] = useState('')

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

  // Xử lý cập nhật/nhập thêm kho vật tư
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

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Quản lý Kho vật tư tiêu hao</h2>
        <p style={{ color: '#64748b', margin: 0 }}>Theo dõi số lượng thuốc, kim tiêm, vật tư nha khoa thực tế</p>
      </div>

      <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f1f5f9', textAlign: 'left' }}>
              <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Mã vật tư</th>
              <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Tên vật tư y tế</th>
              <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Đơn vị tính</th>
              <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1', textAlign: 'center' }}>Số lượng tồn</th>
              <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1', textAlign: 'center' }}>Ngưỡng tối thiểu</th>
              <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1', textAlign: 'center' }}>Trạng thái</th>
              <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1', textAlign: 'center' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {materials.map(m => {
              const isLowStock = m.quantity <= m.min_quantity
              return (
                <tr key={m.id} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: isLowStock ? '#fff5f5' : 'transparent' }}>
                  <td style={{ padding: '12px', color: '#64748b' }}>#{m.id}</td>
                  <td style={{ padding: '12px', fontWeight: 'bold', color: '#1e3a8a' }}>{m.name}</td>
                  <td style={{ padding: '12px' }}>{m.unit}</td>
                  <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>{m.quantity}</td>
                  <td style={{ padding: '12px', textAlign: 'center', color: '#64748b' }}>{m.min_quantity}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    {isLowStock ? (
                      <span style={{ backgroundColor: '#fee2e2', color: '#ef4444', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                        CẦN NHẬP KHO
                      </span>
                    ) : (
                      <span style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                        An toàn
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <button 
                      onClick={() => { setEditingMaterial(m); setEditQty(m.quantity); }}
                      style={{ padding: '6px 12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
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

      {/* Modal điều chỉnh tồn kho */}
      {editingMaterial && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '8px', width: '350px' }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#1e3a8a' }}>Nhập/Sửa số lượng kho</h3>
            <p style={{ fontSize: '14px', color: '#475569', margin: '0 0 15px 0' }}>
              Thay đổi số lượng cho vật tư: <strong>{editingMaterial.name}</strong> ({editingMaterial.unit})
            </p>
            <form onSubmit={handleUpdateStock} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Số lượng mới</label>
                <input 
                  type="number" 
                  value={editQty} 
                  onChange={e => setEditQty(e.target.value)} 
                  required 
                  style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} 
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setEditingMaterial(null)} style={{ padding: '8px 15px' }}>Hủy</button>
                <button type="submit" style={{ padding: '8px 15px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}>Cập nhật</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Inventory
