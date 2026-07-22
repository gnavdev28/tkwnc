import React, { useRef, useState, useEffect } from 'react'

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
    <div style={{ textAlign: 'left', marginTop: '10px' }}>
      <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '5px', color: '#334155' }}>
        Ký tên điện tử xác nhận cam kết (Dùng chuột vẽ chữ ký)
      </label>
      <div style={{ border: '2px dashed #cbd5e1', borderRadius: '6px', display: 'inline-block', backgroundColor: '#fafafa' }}>
        <canvas
          ref={canvasRef}
          width={400}
          height={150}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          style={{ cursor: 'crosshair', display: 'block' }}
        />
      </div>
      <div style={{ marginTop: '5px' }}>
        <button
          type="button"
          onClick={clearCanvas}
          style={{
            padding: '4px 10px',
            fontSize: '12px',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Xóa ký lại
        </button>
      </div>
    </div>
  )
}

export default SignaturePad
