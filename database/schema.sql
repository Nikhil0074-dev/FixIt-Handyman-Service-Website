-- Handyman Service Website - Database Schema
-- MySQL

CREATE DATABASE IF NOT EXISTS handyman_db;
USE handyman_db;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  role ENUM('customer', 'provider', 'admin') DEFAULT 'customer',
  profile_image VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Service Providers Table
CREATE TABLE IF NOT EXISTS service_providers (
  provider_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  bio TEXT,
  experience_years INT DEFAULT 0,
  skills TEXT,
  is_approved BOOLEAN DEFAULT FALSE,
  is_available BOOLEAN DEFAULT TRUE,
  avg_rating DECIMAL(3,2) DEFAULT 0.00,
  total_jobs INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Services Table
CREATE TABLE IF NOT EXISTS services (
  service_id INT AUTO_INCREMENT PRIMARY KEY,
  service_name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  price DECIMAL(10,2) NOT NULL,
  estimated_time VARCHAR(50),
  icon VARCHAR(50),
  image VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Provider Services (many-to-many)
CREATE TABLE IF NOT EXISTS provider_services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  provider_id INT NOT NULL,
  service_id INT NOT NULL,
  custom_price DECIMAL(10,2),
  FOREIGN KEY (provider_id) REFERENCES service_providers(provider_id) ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES services(service_id) ON DELETE CASCADE
);

-- Availability Table
CREATE TABLE IF NOT EXISTS availability (
  id INT AUTO_INCREMENT PRIMARY KEY,
  provider_id INT NOT NULL,
  day_of_week ENUM('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'),
  start_time TIME,
  end_time TIME,
  is_available BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (provider_id) REFERENCES service_providers(provider_id) ON DELETE CASCADE
);

-- Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
  booking_id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  service_provider_id INT NOT NULL,
  service_id INT NOT NULL,
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  address TEXT NOT NULL,
  notes TEXT,
  status ENUM('pending','confirmed','on_the_way','in_progress','completed','cancelled') DEFAULT 'pending',
  total_amount DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES users(user_id),
  FOREIGN KEY (service_provider_id) REFERENCES service_providers(provider_id),
  FOREIGN KEY (service_id) REFERENCES services(service_id)
);

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
  payment_id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method ENUM('credit_card','debit_card','upi','cash') NOT NULL,
  payment_status ENUM('pending','completed','failed','refunded') DEFAULT 'pending',
  transaction_id VARCHAR(100),
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(booking_id)
);

-- Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
  review_id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  customer_id INT NOT NULL,
  provider_id INT NOT NULL,
  rating INT CHECK (rating BETWEEN 1 AND 5),
  feedback TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(booking_id),
  FOREIGN KEY (customer_id) REFERENCES users(user_id),
  FOREIGN KEY (provider_id) REFERENCES service_providers(provider_id)
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  notification_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('booking','payment','review','system') DEFAULT 'system',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Seed: Default Admin
INSERT INTO users (name, email, password, role) VALUES
('Admin', 'admin@handyman.com', '$2b$10$hashedpassword', 'admin');

-- Seed: Services
INSERT INTO services (service_name, description, category, price, estimated_time, icon) VALUES
('Plumbing', 'Fix leaks, pipes, faucets and drainage issues', 'plumbing', 499.00, '1-3 hours', '🔧'),
('Electrical Repair', 'Wiring, switches, outlets and circuit repairs', 'electrical', 599.00, '1-2 hours', '⚡'),
('Home Cleaning', 'Deep cleaning of rooms, kitchens and bathrooms', 'cleaning', 799.00, '3-5 hours', '🧹'),
('Carpentry', 'Furniture repair, door fixing and woodwork', 'carpentry', 699.00, '2-4 hours', '🔨'),
('Appliance Repair', 'Fix washing machines, ACs, fridges and more', 'appliance', 549.00, '1-3 hours', '🛠️'),
('Painting', 'Interior and exterior painting services', 'painting', 1499.00, '1-3 days', '🎨'),
('AC Service', 'AC installation, maintenance and gas refill', 'appliance', 449.00, '1-2 hours', '❄️'),
('Pest Control', 'Effective pest and termite control treatment', 'pest', 899.00, '2-3 hours', '🪲');
