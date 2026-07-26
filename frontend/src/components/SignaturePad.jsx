import React, { useRef, useState, useEffect } from 'react'
import '../css/SignaturePad.css'

function SignaturePad({ onSaveSignature }) {
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [isEmpty, setIsEmpty] = useState(true)

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      ctx.strokeStyle = '#000000'
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
    }
  }, [])

  // Bắt đầu vẽ chữ ký
  const startDrawing = (e) => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    
    ctx.beginPath()
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top)
    setIsDrawing(true)
    setIsEmpty(false)
  }

  // Vẽ các đường nét khi di chuyển chuột
  const draw = (e) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top)
    ctx.stroke()
  }

  // Dừng vẽ
  const stopDrawing = () => {
    if (!isDrawing) return
    setIsDrawing(false)
    
    // Xuất chữ ký thành chuỗi ảnh Base64
    const canvas = canvasRef.current
    const dataUrl = canvas.toDataURL('image/png')
    onSaveSignature(dataUrl)
  }

  // Xóa bảng chữ ký để ký lại
  const clearCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setIsEmpty(true)
    onSaveSignature('')
  }

  return (
    <div className="khung-chu-ky">
      <label className="nhan-viet-chu-ky">
        Ký tên điện tử xác nhận cam kết (Dùng chuột vẽ chữ ký)
      </label>
      <div className="hop-ve-canvas">
        <canvas
          ref={canvasRef}
          width={400}
          height={150}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="bang-ve-chu-ky"
        />
      </div>
      <div className="vung-nut-bam">
        <button
          type="button"
          onClick={clearCanvas}
          className="nut-bam-xoa-ky-lai"
        >
          Xóa ký lại
        </button>
      </div>
    </div>
  )
}

export default SignaturePad
