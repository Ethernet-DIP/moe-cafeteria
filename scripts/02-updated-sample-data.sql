-- Insert updated sample data with fasting/non-fasting categories and salary information

-- Insert sample users (passwords are hashed versions of the demo passwords)
INSERT INTO users (id, username, email, password_hash, full_name, role, is_active, last_login) VALUES
(uuid_generate_v4(), 'admin', 'admin@ministry.gov.et', '$2b$10$rQZ8kHp0rQZ8kHp0rQZ8kOeKqGqGqGqGqGqGqGqGqGqGqGqGqGqGqG', 'አድሚን ተስፋዬ', 'admin', true, CURRENT_TIMESTAMP),
(uuid_generate_v4(), 'manager', 'manager@ministry.gov.et', '$2b$10$mQZ8kHp0rQZ8kHp0rQZ8kOeKqGqGqGqGqGqGqGqGqGqGqGqGqGqGqG', 'ማናጀር አበበ', 'manager', true, CURRENT_TIMESTAMP - INTERVAL '2 hours'),
(uuid_generate_v4(), 'operator', 'operator@ministry.gov.et', '$2b$10$oQZ8kHp0rQZ8kHp0rQZ8kOeKqGqGqGqGqGqGqGqGqGqGqGqGqGqGqG', 'ኦፐሬተር ሰላም', 'operator', true, CURRENT_TIMESTAMP - INTERVAL '1 day');

-- Insert sample meal types (base types without pricing)
INSERT INTO meal_types (id, name, icon, enabled, color) VALUES
('breakfast', 'ቁርስ', 'coffee', true, 'bg-amber-100 text-amber-700'),
('lunch', 'ምሳ', 'utensils', true, 'bg-emerald-100 text-emerald-700'),
('dinner', 'እራት', 'moon', true, 'bg-indigo-100 text-indigo-700'),
('snack', 'መክሰስ', 'coffee', true, 'bg-orange-100 text-orange-700');

-- Insert meal categories with fasting/non-fasting variants and pricing
INSERT INTO meal_categories (meal_type_id, category, name, normal_price, supported_price, enabled) VALUES
-- Breakfast categories
('breakfast', 'fasting', 'ቁርስ - ጾም', 30.00, 20.00, true),
('breakfast', 'non_fasting', 'ቁርስ - የፍስግ', 40.00, 30.00, true),

-- Lunch categories  
('lunch', 'fasting', 'ምሳ - ጾም', 50.00, 40.00, true),
('lunch', 'non_fasting', 'ምሳ - የፍስግ', 60.00, 50.00, true),

-- Dinner categories
('dinner', 'fasting', 'እራት - ጾም', 45.00, 35.00, true),
('dinner', 'non_fasting', 'እራት - የፍስግ', 55.00, 45.00, true),

-- Snack categories
('snack', 'fasting', 'መክሰስ - ጾም', 25.00, 20.00, true),
('snack', 'non_fasting', 'መክሰስ - የፍስግ', 35.00, 25.00, true);

-- Insert sample employees with salary information
INSERT INTO employees (id, employee_id, card_id, short_code, name, department, salary, photo_url, is_active) VALUES
-- Employees eligible for support (salary < 5000)
(uuid_generate_v4(), 'EMP001', '04A2B3C4D5', '1234', 'አበበ ቢቂላ', 'ኢንጂነሪንግ', 4500.00, '/placeholder.svg?height=200&width=200&text=አበ', true),
(uuid_generate_v4(), 'EMP002', '15F6E7D8C9', '5678', 'ሰላም ታደሰ', 'ማርኬቲንግ', 3800.00, '/placeholder.svg?height=200&width=200&text=ሰላ', true),
(uuid_generate_v4(), 'EMP003', '26A7B8C9D0', '9012', 'ፍቃዱ ተስፋዬ', 'ፋይናንስ', 4200.00, '/placeholder.svg?height=200&width=200&text=ፍቃ', false),
(uuid_generate_v4(), 'EMP004', '37B8C9D0E1', '3456', 'ሄኖክ መንግስቱ', 'ሰው ሃይል', 4800.00, '/placeholder.svg?height=200&width=200&text=ሄኖ', true),
(uuid_generate_v4(), 'EMP005', '48C9D0E1F2', '7890', 'ብርሃን አለሙ', 'ኢንፎርሜሽን ቴክኖሎጂ', 4600.00, '/placeholder.svg?height=200&width=200&text=ብር', true),

-- Employees not eligible for support (salary >= 5000)
(uuid_generate_v4(), 'EMP006', '59D0E1F2G3', '2345', 'ዳንኤል ገብሬ', 'ኢንጂነሪንግ', 6500.00, '/placeholder.svg?height=200&width=200&text=ዳን', true),
(uuid_generate_v4(), 'EMP007', '6AE1F2G3H4', '6789', 'ሳራ ወልደ', 'ማርኬቲንግ', 7200.00, '/placeholder.svg?height=200&width=200&text=ሳራ', true),
(uuid_generate_v4(), 'EMP008', '7BF2G3H4I5', '0123', 'ሙሉጌታ ተክሌ', 'ፋይናንስ', 8500.00, '/placeholder.svg?height=200&width=200&text=ሙሉ', false),
(uuid_generate_v4(), 'EMP009', '8CG3H4I5J6', '4567', 'ሄለን ዮሴፍ', 'ሰው ሃይል', 5500.00, '/placeholder.svg?height=200&width=200&text=ሄለ', true),
(uuid_generate_v4(), 'EMP010', '9DH4I5J6K7', '8901', 'ተስፋዬ አበራ', 'ኢንፎርሜሽን ቴክኖሎጂ', 9200.00, '/placeholder.svg?height=200&width=200&text=ተስ', true);

-- Insert sample meal records with enhanced pricing information
DO $$
DECLARE
    breakfast_fasting_id UUID;
    breakfast_non_fasting_id UUID;
    lunch_fasting_id UUID;
    lunch_non_fasting_id UUID;
    dinner_fasting_id UUID;
    dinner_non_fasting_id UUID;
BEGIN
    -- Get meal category IDs
    SELECT id INTO breakfast_fasting_id FROM meal_categories WHERE meal_type_id = 'breakfast' AND category = 'fasting';
    SELECT id INTO breakfast_non_fasting_id FROM meal_categories WHERE meal_type_id = 'breakfast' AND category = 'non_fasting';
    SELECT id INTO lunch_fasting_id FROM meal_categories WHERE meal_type_id = 'lunch' AND category = 'fasting';
    SELECT id INTO lunch_non_fasting_id FROM meal_categories WHERE meal_type_id = 'lunch' AND category = 'non_fasting';
    SELECT id INTO dinner_fasting_id FROM meal_categories WHERE meal_type_id = 'dinner' AND category = 'fasting';
    SELECT id INTO dinner_non_fasting_id FROM meal_categories WHERE meal_type_id = 'dinner' AND category = 'non_fasting';

    -- Insert sample meal records for today
    INSERT INTO meal_records (employee_id, card_id, meal_type_id, meal_category_id, meal_name, category, price_type, normal_price, supported_price, actual_price, support_amount, employee_salary, recorded_at) VALUES
    -- Supported employees (salary < 5000) - they get supported pricing
    ('EMP001', '04A2B3C4D5', 'breakfast', breakfast_fasting_id, 'ቁርስ - ጾም', 'fasting', 'supported', 30.00, 20.00, 20.00, 10.00, 4500.00, CURRENT_TIMESTAMP - INTERVAL '2 hours'),
    ('EMP002', '15F6E7D8C9', 'breakfast', breakfast_non_fasting_id, 'ቁርስ - የፍስግ', 'non_fasting', 'supported', 40.00, 30.00, 30.00, 10.00, 3800.00, CURRENT_TIMESTAMP - INTERVAL '2 hours'),
    ('EMP004', '37B8C9D0E1', 'lunch', lunch_fasting_id, 'ምሳ - ጾም', 'fasting', 'supported', 50.00, 40.00, 40.00, 10.00, 4800.00, CURRENT_TIMESTAMP - INTERVAL '30 minutes'),
    ('EMP005', '48C9D0E1F2', 'lunch', lunch_non_fasting_id, 'ምሳ - የፍስግ', 'non_fasting', 'supported', 60.00, 50.00, 50.00, 10.00, 4600.00, CURRENT_TIMESTAMP - INTERVAL '25 minutes'),
    
    -- Non-supported employees (salary >= 5000) - they pay normal pricing
    ('EMP006', '59D0E1F2G3', 'lunch', lunch_fasting_id, 'ምሳ - ጾም', 'fasting', 'normal', 50.00, 40.00, 50.00, 0.00, 6500.00, CURRENT_TIMESTAMP - INTERVAL '20 minutes'),
    ('EMP007', '6AE1F2G3H4', 'lunch', lunch_non_fasting_id, 'ምሳ - የፍስግ', 'non_fasting', 'normal', 60.00, 50.00, 60.00, 0.00, 7200.00, CURRENT_TIMESTAMP - INTERVAL '15 minutes'),

    -- Yesterday's records
    ('EMP001', '04A2B3C4D5', 'breakfast', breakfast_fasting_id, 'ቁርስ - ጾም', 'fasting', 'supported', 30.00, 20.00, 20.00, 10.00, 4500.00, CURRENT_TIMESTAMP - INTERVAL '1 day 2 hours'),
    ('EMP001', '04A2B3C4D5', 'lunch', lunch_fasting_id, 'ምሳ - ጾም', 'fasting', 'supported', 50.00, 40.00, 40.00, 10.00, 4500.00, CURRENT_TIMESTAMP - INTERVAL '1 day 30 minutes'),
    ('EMP002', '15F6E7D8C9', 'breakfast', breakfast_non_fasting_id, 'ቁርስ - የፍስግ', 'non_fasting', 'supported', 40.00, 30.00, 30.00, 10.00, 3800.00, CURRENT_TIMESTAMP - INTERVAL '1 day 2 hours'),
    ('EMP002', '15F6E7D8C9', 'dinner', dinner_fasting_id, 'እራት - ጾም', 'fasting', 'supported', 45.00, 35.00, 35.00, 10.00, 3800.00, CURRENT_TIMESTAMP - INTERVAL '1 day'),
    ('EMP004', '37B8C9D0E1', 'lunch', lunch_non_fasting_id, 'ምሳ - የፍስግ', 'non_fasting', 'supported', 60.00, 50.00, 50.00, 10.00, 4800.00, CURRENT_TIMESTAMP - INTERVAL '1 day 30 minutes'),
    ('EMP005', '48C9D0E1F2', 'breakfast', breakfast_fasting_id, 'ቁርስ - ጾም', 'fasting', 'supported', 30.00, 20.00, 20.00, 10.00, 4600.00, CURRENT_TIMESTAMP - INTERVAL '1 day 2 hours'),
    ('EMP005', '48C9D0E1F2', 'lunch', lunch_fasting_id, 'ምሳ - ጾም', 'fasting', 'supported', 50.00, 40.00, 40.00, 10.00, 4600.00, CURRENT_TIMESTAMP - INTERVAL '1 day 30 minutes'),
    ('EMP006', '59D0E1F2G3', 'lunch', lunch_non_fasting_id, 'ምሳ - የፍስግ', 'non_fasting', 'normal', 60.00, 50.00, 60.00, 0.00, 6500.00, CURRENT_TIMESTAMP - INTERVAL '1 day 30 minutes'),
    ('EMP007', '6AE1F2G3H4', 'breakfast', breakfast_fasting_id, 'ቁርስ - ጾም', 'fasting', 'normal', 30.00, 20.00, 30.00, 0.00, 7200.00, CURRENT_TIMESTAMP - INTERVAL '1 day 2 hours'),
    ('EMP009', '8CG3H4I5J6', 'lunch', lunch_fasting_id, 'ምሳ - ጾም', 'fasting', 'normal', 50.00, 40.00, 50.00, 0.00, 5500.00, CURRENT_TIMESTAMP - INTERVAL '1 day 30 minutes'),
    ('EMP010', '9DH4I5J6K7', 'breakfast', breakfast_non_fasting_id, 'ቁርስ - የፍስግ', 'non_fasting', 'normal', 40.00, 30.00, 40.00, 0.00, 9200.00, CURRENT_TIMESTAMP - INTERVAL '1 day 2 hours');

    -- Insert more historical records for better reporting
    INSERT INTO meal_records (employee_id, card_id, meal_type_id, meal_category_id, meal_name, category, price_type, normal_price, supported_price, actual_price, support_amount, employee_salary, recorded_at) VALUES
    -- 2 days ago
    ('EMP001', '04A2B3C4D5', 'breakfast', breakfast_fasting_id, 'ቁርስ - ጾም', 'fasting', 'supported', 30.00, 20.00, 20.00, 10.00, 4500.00, CURRENT_TIMESTAMP - INTERVAL '2 days 2 hours'),
    ('EMP001', '04A2B3C4D5', 'lunch', lunch_non_fasting_id, 'ምሳ - የፍስግ', 'non_fasting', 'supported', 60.00, 50.00, 50.00, 10.00, 4500.00, CURRENT_TIMESTAMP - INTERVAL '2 days 30 minutes'),
    ('EMP002', '15F6E7D8C9', 'lunch', lunch_fasting_id, 'ምሳ - ጾም', 'fasting', 'supported', 50.00, 40.00, 40.00, 10.00, 3800.00, CURRENT_TIMESTAMP - INTERVAL '2 days 30 minutes'),
    ('EMP004', '37B8C9D0E1', 'breakfast', breakfast_non_fasting_id, 'ቁርስ - የፍስግ', 'non_fasting', 'supported', 40.00, 30.00, 30.00, 10.00, 4800.00, CURRENT_TIMESTAMP - INTERVAL '2 days 2 hours'),
    ('EMP004', '37B8C9D0E1', 'lunch', lunch_fasting_id, 'ምሳ - ጾም', 'fasting', 'supported', 50.00, 40.00, 40.00, 10.00, 4800.00, CURRENT_TIMESTAMP - INTERVAL '2 days 30 minutes'),
    ('EMP005', '48C9D0E1F2', 'lunch', lunch_non_fasting_id, 'ምሳ - የፍስግ', 'non_fasting', 'supported', 60.00, 50.00, 50.00, 10.00, 4600.00, CURRENT_TIMESTAMP - INTERVAL '2 days 30 minutes'),
    ('EMP006', '59D0E1F2G3', 'breakfast', breakfast_fasting_id, 'ቁርስ - ጾም', 'fasting', 'normal', 30.00, 20.00, 30.00, 0.00, 6500.00, CURRENT_TIMESTAMP - INTERVAL '2 days 2 hours'),
    ('EMP007', '6AE1F2G3H4', 'lunch', lunch_non_fasting_id, 'ምሳ - የፍስግ', 'non_fasting', 'normal', 60.00, 50.00, 60.00, 0.00, 7200.00, CURRENT_TIMESTAMP - INTERVAL '2 days 30 minutes'),
    ('EMP009', '8CG3H4I5J6', 'breakfast', breakfast_fasting_id, 'ቁርስ - ጾም', 'fasting', 'normal', 30.00, 20.00, 30.00, 0.00, 5500.00, CURRENT_TIMESTAMP - INTERVAL '2 days 2 hours'),
    ('EMP010', '9DH4I5J6K7', 'lunch', lunch_fasting_id, 'ምሳ - ጾም', 'fasting', 'normal', 50.00, 40.00, 50.00, 0.00, 9200.00, CURRENT_TIMESTAMP - INTERVAL '2 days 30 minutes');

END $$;

-- Insert sample coupon batches with category support
DO $$
DECLARE
    admin_user_id UUID;
    manager_user_id UUID;
    lunch_fasting_id UUID;
    breakfast_non_fasting_id UUID;
BEGIN
    -- Get user and category IDs
    SELECT id INTO admin_user_id FROM users WHERE username = 'admin' LIMIT 1;
    SELECT id INTO manager_user_id FROM users WHERE username = 'manager' LIMIT 1;
    SELECT id INTO lunch_fasting_id FROM meal_categories WHERE meal_type_id = 'lunch' AND category = 'fasting';
    SELECT id INTO breakfast_non_fasting_id FROM meal_categories WHERE meal_type_id = 'breakfast' AND category = 'non_fasting';
    
    -- Insert sample coupon batches
    INSERT INTO coupon_batches (batch_number, title, meal_type_id, meal_category_id, meal_type_name, category, total_coupons, color, generated_by_user_id, generated_by_name, is_active) VALUES
    ('BATCH-LX8K9M2P-A1B2', 'Staff Lunch Coupons - Fasting', 'lunch', lunch_fasting_id, 'ምሳ - ጾም', 'fasting', 50, 'bg-green-500', admin_user_id, 'አድሚን ተስፋዬ', true),
    ('BATCH-MN7J8K1O-C3D4', 'Guest Breakfast Vouchers - Non-Fasting', 'breakfast', breakfast_non_fasting_id, 'ቁርስ - የፍስግ', 'non_fasting', 25, 'bg-blue-500', manager_user_id, 'ማናጀር አበበ', true),
    ('BATCH-OP6I7J0N-E5F6', 'General Lunch Coupons', 'lunch', NULL, 'ምሳ', NULL, 30, 'bg-purple-500', admin_user_id, 'አድሚን ተስፋዬ', false);
    
    -- Insert sample coupons
    INSERT INTO coupons (code, batch_number, title, meal_type_id, meal_category_id, meal_type_name, category, is_used, is_active, color, generated_by_user_id, generated_by_name, used_by_employee_id, used_at) VALUES
    ('LCH001A1', 'BATCH-LX8K9M2P-A1B2', 'Staff Lunch Coupons - Fasting', 'lunch', lunch_fasting_id, 'ምሳ - ጾም', 'fasting', true, true, 'bg-green-500', admin_user_id, 'አድሚን ተስፋዬ', 'EMP001', CURRENT_TIMESTAMP - INTERVAL '2 days'),
    ('LCH002B2', 'BATCH-LX8K9M2P-A1B2', 'Staff Lunch Coupons - Fasting', 'lunch', lunch_fasting_id, 'ምሳ - ጾም', 'fasting', true, true, 'bg-green-500', admin_user_id, 'አድሚን ተስፋዬ', 'EMP002', CURRENT_TIMESTAMP - INTERVAL '1 day'),
    ('LCH003C3', 'BATCH-LX8K9M2P-A1B2', 'Staff Lunch Coupons - Fasting', 'lunch', lunch_fasting_id, 'ምሳ - ጾም', 'fasting', false, true, 'bg-green-500', admin_user_id, 'አድሚን ተስፋዬ', NULL, NULL),
    ('BRK001F6', 'BATCH-MN7J8K1O-C3D4', 'Guest Breakfast Vouchers - Non-Fasting', 'breakfast', breakfast_non_fasting_id, 'ቁርስ - የፍስግ', 'non_fasting', false, true, 'bg-blue-500', manager_user_id, 'ማናጀር አበበ', NULL, NULL),
    ('BRK002G7', 'BATCH-MN7J8K1O-C3D4', 'Guest Breakfast Vouchers - Non-Fasting', 'breakfast', breakfast_non_fasting_id, 'ቁርስ - የፍስግ', 'non_fasting', false, true, 'bg-blue-500', manager_user_id, 'ማናጀር አበበ', NULL, NULL);
    
END $$;
