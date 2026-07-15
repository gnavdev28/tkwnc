-- Tạo cơ sở dữ liệu
CREATE DATABASE IF NOT EXISTS `nhakhoa_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `nhakhoa_db`;

-- 1. Bảng tài khoản nhân viên (users)
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `fullname` VARCHAR(100) NOT NULL,
  `role` ENUM('admin', 'doctor', 'staff') NOT NULL DEFAULT 'staff',
  `twofa_secret` VARCHAR(255) NULL,
  `twofa_enabled` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Bảng thông tin bệnh nhân (patients)
CREATE TABLE IF NOT EXISTS `patients` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `fullname` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(15) NOT NULL,
  `email` VARCHAR(100) NULL,
  `dob` DATE NOT NULL,
  `gender` ENUM('male', 'female', 'other') NOT NULL DEFAULT 'male',
  `address` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Bảng kho vật tư tiêu hao (materials)
CREATE TABLE IF NOT EXISTS `materials` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `unit` VARCHAR(20) NOT NULL,
  `quantity` INT NOT NULL DEFAULT 0,
  `min_quantity` INT NOT NULL DEFAULT 10,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Bảng ca điều trị / bệnh án (treatments)
CREATE TABLE IF NOT EXISTS `treatments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `patient_id` INT NOT NULL,
  `doctor_id` INT NOT NULL,
  `treatment_date` DATE NOT NULL,
  `total_cost` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `payment_status` ENUM('unpaid', 'partially_paid', 'paid') NOT NULL DEFAULT 'unpaid',
  `signature_path` VARCHAR(255) NULL,
  `notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`doctor_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Bảng chi tiết điều trị răng (treatment_details)
CREATE TABLE IF NOT EXISTS `treatment_details` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `treatment_id` INT NOT NULL,
  `tooth_number` INT NOT NULL, -- Số hiệu răng từ 11 đến 48
  `condition` ENUM('healthy', 'decayed', 'missing', 'filled', 'crown', 'implant') NOT NULL DEFAULT 'healthy',
  `notes` TEXT NULL,
  FOREIGN KEY (`treatment_id`) REFERENCES `treatments`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Bảng vật tư đã dùng trong ca điều trị (treatment_materials)
CREATE TABLE IF NOT EXISTS `treatment_materials` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `treatment_id` INT NOT NULL,
  `material_id` INT NOT NULL,
  `quantity_used` INT NOT NULL DEFAULT 1,
  FOREIGN KEY (`treatment_id`) REFERENCES `treatments`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`material_id`) REFERENCES `materials`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Bảng lịch sử đóng tiền thanh toán (payments)
CREATE TABLE IF NOT EXISTS `payments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `treatment_id` INT NOT NULL,
  `amount_paid` DECIMAL(12, 2) NOT NULL,
  `payment_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `payment_method` ENUM('cash', 'bank_transfer', 'card') NOT NULL DEFAULT 'cash',
  `notes` TEXT NULL,
  FOREIGN KEY (`treatment_id`) REFERENCES `treatments`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Bảng kế hoạch thanh toán trả góp (installment_plans)
CREATE TABLE IF NOT EXISTS `installment_plans` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `treatment_id` INT NOT NULL,
  `due_date` DATE NOT NULL,
  `amount_due` DECIMAL(12, 2) NOT NULL,
  `status` ENUM('pending', 'paid') NOT NULL DEFAULT 'pending',
  FOREIGN KEY (`treatment_id`) REFERENCES `treatments`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- DỮ LIỆU THỬ NGHIỆM BAN ĐẦU (SEED DATA)
-- Mật khẩu mặc định cho các tài khoản là '123456' (đã được băm bằng bcrypt)
-- bcrypt hash của '123456' là: $2b$10$wK1VfR94pCstGWhwFh.gKOpR2cO7L6J94tW.cI0qA0RvxXw6dNufe
INSERT INTO `users` (`username`, `password`, `fullname`, `role`) VALUES
('admin', '$2b$10$wK1VfR94pCstGWhwFh.gKOpR2cO7L6J94tW.cI0qA0RvxXw6dNufe', 'Nguyen Quan Tri', 'admin'),
('doctor1', '$2b$10$wK1VfR94pCstGWhwFh.gKOpR2cO7L6J94tW.cI0qA0RvxXw6dNufe', 'Bac Si Tran Van A', 'doctor'),
('staff1', '$2b$10$wK1VfR94pCstGWhwFh.gKOpR2cO7L6J94tW.cI0qA0RvxXw6dNufe', 'Le Thu Ngan', 'staff');

-- Thêm một số vật tư y tế ban đầu
INSERT INTO `materials` (`name`, `unit`, `quantity`, `min_quantity`) VALUES
('Thuoc te lidocaine 2%', 'ong', 150, 20),
('Composite tram rang', 'tuyp', 40, 10),
('Bong cuon y te', 'goi', 80, 15),
('Kim tiem nha khoa', 'cai', 200, 30),
('Dung dich sat khuan betadine', 'chai', 15, 5);

-- Thêm một số bệnh nhân ban đầu
INSERT INTO `patients` (`fullname`, `phone`, `email`, `dob`, `gender`, `address`) VALUES
('Nguyen Van Binh', '0912345678', 'binh@gmail.com', '1995-10-15', 'male', '123 Nguyen Trai, Ha Noi'),
('Tran Thi Mai', '0987654321', 'mai@yahoo.com', '2000-05-20', 'female', '456 Tran Hung Dao, TP.HCM');
