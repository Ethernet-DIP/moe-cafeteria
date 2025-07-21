-- Updated Cafeteria Management System Database Schema
-- PostgreSQL Database Schema with Fasting/Non-Fasting and Support Pricing

-- Create database (run this separately if needed)
-- CREATE DATABASE cafeteria_management;

-- Use the database
-- \c cafeteria_management;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'operator');
CREATE TYPE meal_icon AS ENUM ('coffee', 'utensils', 'moon');
CREATE TYPE meal_category AS ENUM ('fasting', 'non_fasting');
CREATE TYPE price_type AS ENUM ('normal', 'supported');

-- Users table for authentication and authorization
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'operator',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

-- Meal types table (base meal types like breakfast, lunch, dinner)
CREATE TABLE meal_types (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon meal_icon NOT NULL DEFAULT 'utensils',
    enabled BOOLEAN NOT NULL DEFAULT true,
    color VARCHAR(100) NOT NULL DEFAULT 'bg-emerald-100 text-emerald-700',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Meal categories table (fasting and non-fasting variants for each meal type)
CREATE TABLE meal_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meal_type_id VARCHAR(50) NOT NULL,
    category meal_category NOT NULL,
    name VARCHAR(100) NOT NULL, -- e.g., "ቁርስ - ጾም", "ቁርስ - የፍስግ"
    normal_price DECIMAL(10,2) NOT NULL CHECK (normal_price > 0),
    supported_price DECIMAL(10,2) NOT NULL CHECK (supported_price > 0),
    enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (meal_type_id) REFERENCES meal_types(id) ON DELETE CASCADE,
    UNIQUE(meal_type_id, category)
);

-- Employees table with salary information
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    card_id VARCHAR(100) UNIQUE,
    short_code VARCHAR(4) UNIQUE,
    name VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL,
    salary DECIMAL(10,2) CHECK (salary >= 0), -- Monthly salary in ETB
    photo_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Meal records table with enhanced pricing information
CREATE TABLE meal_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id VARCHAR(50) NOT NULL,
    card_id VARCHAR(100) NOT NULL,
    meal_type_id VARCHAR(50) NOT NULL,
    meal_category_id UUID NOT NULL,
    meal_name VARCHAR(100) NOT NULL, -- Full name like "ቁርስ - ጾም"
    category meal_category NOT NULL,
    price_type price_type NOT NULL, -- normal or supported
    normal_price DECIMAL(10,2) NOT NULL,
    supported_price DECIMAL(10,2) NOT NULL,
    actual_price DECIMAL(10,2) NOT NULL, -- Price actually charged
    support_amount DECIMAL(10,2) NOT NULL DEFAULT 0, -- Amount subsidized
    employee_salary DECIMAL(10,2), -- Employee salary at time of transaction
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE,
    FOREIGN KEY (meal_type_id) REFERENCES meal_types(id) ON DELETE RESTRICT,
    FOREIGN KEY (meal_category_id) REFERENCES meal_categories(id) ON DELETE RESTRICT
);

-- Coupon batches table
CREATE TABLE coupon_batches (
    batch_number VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    meal_type_id VARCHAR(50) NOT NULL,
    meal_category_id UUID, -- Can be NULL for general coupons
    meal_type_name VARCHAR(100) NOT NULL,
    category meal_category, -- Can be NULL for general coupons
    total_coupons INTEGER NOT NULL CHECK (total_coupons > 0),
    color VARCHAR(100) NOT NULL,
    generated_by_user_id UUID NOT NULL,
    generated_by_name VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (meal_type_id) REFERENCES meal_types(id) ON DELETE RESTRICT,
    FOREIGN KEY (meal_category_id) REFERENCES meal_categories(id) ON DELETE RESTRICT,
    FOREIGN KEY (generated_by_user_id) REFERENCES users(id) ON DELETE RESTRICT
);

-- Coupons table
CREATE TABLE coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) UNIQUE NOT NULL,
    batch_number VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    meal_type_id VARCHAR(50) NOT NULL,
    meal_category_id UUID,
    meal_type_name VARCHAR(100) NOT NULL,
    category meal_category,
    is_used BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    color VARCHAR(100) NOT NULL,
    generated_by_user_id UUID NOT NULL,
    generated_by_name VARCHAR(255) NOT NULL,
    used_by_employee_id VARCHAR(50),
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (batch_number) REFERENCES coupon_batches(batch_number) ON DELETE CASCADE,
    FOREIGN KEY (meal_type_id) REFERENCES meal_types(id) ON DELETE RESTRICT,
    FOREIGN KEY (meal_category_id) REFERENCES meal_categories(id) ON DELETE RESTRICT,
    FOREIGN KEY (generated_by_user_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (used_by_employee_id) REFERENCES employees(employee_id) ON DELETE SET NULL
);

-- Support eligibility configuration table
CREATE TABLE support_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    max_salary_for_support DECIMAL(10,2) NOT NULL DEFAULT 5000.00,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default support configuration
INSERT INTO support_config (max_salary_for_support) VALUES (5000.00);

-- Create indexes for better performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

CREATE INDEX idx_employees_employee_id ON employees(employee_id);
CREATE INDEX idx_employees_card_id ON employees(card_id);
CREATE INDEX idx_employees_short_code ON employees(short_code);
CREATE INDEX idx_employees_is_active ON employees(is_active);
CREATE INDEX idx_employees_department ON employees(department);
CREATE INDEX idx_employees_salary ON employees(salary);

CREATE INDEX idx_meal_types_enabled ON meal_types(enabled);

CREATE INDEX idx_meal_categories_meal_type_id ON meal_categories(meal_type_id);
CREATE INDEX idx_meal_categories_category ON meal_categories(category);
CREATE INDEX idx_meal_categories_enabled ON meal_categories(enabled);

CREATE INDEX idx_meal_records_employee_id ON meal_records(employee_id);
CREATE INDEX idx_meal_records_meal_type_id ON meal_records(meal_type_id);
CREATE INDEX idx_meal_records_meal_category_id ON meal_records(meal_category_id);
CREATE INDEX idx_meal_records_category ON meal_records(category);
CREATE INDEX idx_meal_records_price_type ON meal_records(price_type);
CREATE INDEX idx_meal_records_recorded_at ON meal_records(recorded_at);
CREATE INDEX idx_meal_records_date ON meal_records(DATE(recorded_at));

CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_batch_number ON coupons(batch_number);
CREATE INDEX idx_coupons_meal_type_id ON coupons(meal_type_id);
CREATE INDEX idx_coupons_meal_category_id ON coupons(meal_category_id);
CREATE INDEX idx_coupons_category ON coupons(category);
CREATE INDEX idx_coupons_is_used ON coupons(is_used);
CREATE INDEX idx_coupons_is_active ON coupons(is_active);
CREATE INDEX idx_coupons_used_by ON coupons(used_by_employee_id);

CREATE INDEX idx_coupon_batches_meal_type_id ON coupon_batches(meal_type_id);
CREATE INDEX idx_coupon_batches_meal_category_id ON coupon_batches(meal_category_id);
CREATE INDEX idx_coupon_batches_generated_by ON coupon_batches(generated_by_user_id);
CREATE INDEX idx_coupon_batches_is_active ON coupon_batches(is_active);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meal_types_updated_at BEFORE UPDATE ON meal_types
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meal_categories_updated_at BEFORE UPDATE ON meal_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coupon_batches_updated_at BEFORE UPDATE ON coupon_batches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON coupons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_config_updated_at BEFORE UPDATE ON support_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
