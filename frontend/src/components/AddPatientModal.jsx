import React, { useState } from 'react'

function AddPatientModal({ onClose, onSubmit }) {
  const [fullname, setFullname] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [dob, setDob] = useState('')
  const [gender, setGender] = useState('male')
  const [address, setAddress] = useState('')

  // Xử lý nộp form thêm bệnh nhân
  function handleFormSubmit(e) {
    e.preventDefault()
    onSubmit({
      fullname: fullname,
      phone: phone,
      email: email,
      dob: dob,
      gender: gender,
      address: address
    })
  }

  return (
    <div className="nen-mo-hop-thoai-phu-man-hinh">
      <div className="than-hop-thoai-nho">
        <h3>Thêm Bệnh nhân mới</h3>
        <form onSubmit={handleFormSubmit} className="khung-nhap-doc">
          <input type="text" placeholder="Họ và tên *" value={fullname} onChange={function(e) { setFullname(e.target.value) }} required className="o-nhap-chu" />
          <input type="text" placeholder="Số điện thoại *" value={phone} onChange={function(e) { setPhone(e.target.value) }} required className="o-nhap-chu" />
          <input type="email" placeholder="Email" value={email} onChange={function(e) { setEmail(e.target.value) }} className="o-nhap-chu" />
          <input type="date" placeholder="Ngày sinh *" value={dob} onChange={function(e) { setDob(e.target.value) }} required className="o-nhap-chu" />
          
          <select value={gender} onChange={function(e) { setGender(e.target.value) }} className="o-chon-lua-drop-down">
            <option value="male">Nam</option>
            <option value="female">Nữ</option>
          </select>
          
          <textarea placeholder="Địa chỉ" value={address} onChange={function(e) { setAddress(e.target.value) }} className="o-nhap-chu-nhieu-dong" />
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={onClose} className="nut-huy-bo">Hủy</button>
            <button type="submit" className="nut-luu-lai">Lưu</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddPatientModal
