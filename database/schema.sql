-- Skema Database: Universal Multi-Bank Defect Tracking & Daily Reporting System
-- PT Sarana Pactindo

CREATE DATABASE IF NOT EXISTS `sistem_pkl_defect` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `sistem_pkl_defect`;

-- 1. Clients (Bank Klien)
CREATE TABLE IF NOT EXISTS `clients` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `client_name` VARCHAR(150) NOT NULL,
    `client_code` VARCHAR(50) NOT NULL UNIQUE,
    `status` ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Projects (Platform per Bank)
CREATE TABLE IF NOT EXISTS `projects` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `client_id` INT NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `platform` ENUM('Mobile Banking', 'Internet Banking', 'QRIS Engine', 'Core Banking Switching', 'Backoffice CMS') NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. Modules (Fitur fungsional spesifik)
CREATE TABLE IF NOT EXISTS `modules` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `project_id` INT NOT NULL,
    `module_name` VARCHAR(150) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. Users (Role: QC, DEVELOPER, LEAD, PM)
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `role` ENUM('QC', 'DEVELOPER', 'LEAD', 'PM') NOT NULL,
    `phone` VARCHAR(30) NULL,
    `avatar` VARCHAR(255) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 5. Defects (Data inti defect)
CREATE TABLE IF NOT EXISTS `defects` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `ticket_number` VARCHAR(50) NOT NULL UNIQUE,
    `module_id` INT NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `severity` ENUM('Low', 'Medium', 'High', 'Blocker') NOT NULL DEFAULT 'Medium',
    `environment` ENUM('DEV', 'SIT', 'UAT', 'Pre-Prod') NOT NULL DEFAULT 'SIT',
    `steps_to_reproduce` TEXT NULL,
    `expected_result` TEXT NULL,
    `actual_result` TEXT NULL,
    `payload_log` LONGTEXT NULL,
    `status` ENUM('Open', 'Retesting', 'Re-open', 'Close') NOT NULL DEFAULT 'Open',
    `dev_id` INT NULL,
    `qc_id` INT NOT NULL,
    `reopen_count` INT NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`module_id`) REFERENCES `modules`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`dev_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`qc_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. Defect Activities (Audit Trail & Activity Log)
CREATE TABLE IF NOT EXISTS `defect_activities` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `defect_id` INT NOT NULL,
    `user_id` INT NOT NULL,
    `from_status` VARCHAR(50) NULL,
    `to_status` VARCHAR(50) NOT NULL,
    `notes` TEXT NULL,
    `build_number` VARCHAR(100) NULL,
    `commit_hash` VARCHAR(100) NULL,
    `attachment_url` VARCHAR(255) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`defect_id`) REFERENCES `defects`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. Notifications (Real-time In-App Notification)
CREATE TABLE IF NOT EXISTS `notifications` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `defect_id` INT NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `message` TEXT NOT NULL,
    `type` VARCHAR(50) DEFAULT 'status_update',
    `is_read` TINYINT(1) NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`defect_id`) REFERENCES `defects`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Indexing untuk query performance
CREATE INDEX idx_defects_status ON defects(status);
CREATE INDEX idx_defects_created_at ON defects(created_at);
CREATE INDEX idx_defects_module ON defects(module_id);
CREATE INDEX idx_activities_defect ON defect_activities(defect_id);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
