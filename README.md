# ĐỒ ÁN MÔN HỌC: HỆ THỐNG QUẢN LÝ PHÒNG KHÁM NHA KHOA

Dự án phát triển ứng dụng quản lý phòng khám Nha khoa Full-stack sử dụng kiến trúc phân tách Client-Server (Frontend React độc lập giao tiếp qua REST API với Backend Express MVC và Database MySQL).

---

## 👥 THÀNH VIÊN THỰC HIỆN
1. **Phạm Quang Hà** - **24100262** (Nhóm trưởng)
2. **Ngô Tâm Ngọc** - **24108752**
3. **Hồ Sỹ Long** - **24100319**

---

## 🏗️ KIẾN TRÚC DỰ ÁN
Dự án được phân tách thành hai phần rõ rệt để tối ưu hóa hiệu năng và quản lý mã nguồn:

### 1. Backend (`/backend`) - Express REST API (MVC Pattern)
* **Model**: Thực hiện kết nối và truy vấn CSDL MySQL sử dụng thư viện `mysql2/promise`.
* **Controller**: Chứa logic xử lý nghiệp vụ, quản lý phiên làm việc bằng Session-Cookie (`express-session`), xác thực bảo mật mật khẩu (`bcrypt`), tích hợp OTP và QR Code 2 lớp (`speakeasy`, `qrcode`).
* **Routes**: Định tuyến yêu cầu HTTP từ client.

### 2. Frontend (`/frontend`) - React SPA (Vite)
* Giao diện SPA (Single Page Application) tương tác thời gian thực, giao tiếp mạng với backend bằng `axios`.
* Chứa các thành phần vẽ chữ ký cảm ứng HTML5 Canvas, các trang tổng quan số liệu Dashboard, tài chính thanh toán trả góp và xuất báo cáo tài chính trực tiếp dưới định dạng `.xlsx`.

---

## ⚙️ HƯỚNG DẪN CÀI ĐẶT & CHẠY DỰ ÁN

### 1. Chuẩn bị Cơ sở dữ liệu (Database)
* Mở hệ quản trị cơ sở dữ liệu MySQL (MySQL Workbench, Navicat hoặc phpMyAdmin).
* Import/Chạy toàn bộ mã SQL có sẵn trong file **`backend/database.sql`** để tạo cơ sở dữ liệu `nhakhoa_db` và các bảng dữ liệu mẫu ban đầu.

### 2. Cấu hình môi trường Backend
* Di chuyển vào thư mục backend và tạo file cấu hình môi trường **`backend/.env`**:
  ```env
  PORT=3000
  DB_HOST=localhost
  DB_USER=root
  DB_PASSWORD=Nhập_mật_khẩu_mysql_của_bạn
  DB_NAME=nhakhoa_db
  SESSION_SECRET=nhakhoasecretkey_2026
  ```

### 3. Cài đặt và Chạy Server Backend
Mở terminal tại thư mục gốc của dự án và chạy:
```bash
cd backend
npm install
npm run dev
```
*(Server backend sẽ chạy tại địa chỉ: `http://localhost:3000`)*

### 4. Cài đặt và Chạy Client Frontend
Mở một cửa sổ terminal mới tại thư mục gốc của dự án và chạy:
```bash
cd frontend
npm install
npm run dev
```
*(Client frontend sẽ chạy tại địa chỉ: `http://localhost:5173`)*

---

## 🔑 TÀI KHOẢN ĐĂNG NHẬP KIỂM THỬ MẪU
* **Tài khoản**: `admin`
* **Mật khẩu**: `123456`
