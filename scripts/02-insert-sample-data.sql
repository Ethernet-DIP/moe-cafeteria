-- Insert sample data for Cafeteria Management System

-- Insert sample users (passwords are hashed versions of the demo passwords)
-- Note: In production, use proper password hashing like bcrypt
INSERT INTO users (id, username, email, password_hash, full_name, role, is_active, last_login) VALUES
(uuid_generate_v4(), 'admin', 'admin@ethernet.edu.et', '$2b$10$rQZ8kHp0rQZ8kHp0rQZ8kOeKqGqGqGqGqGqGqGqGqGqGqGqGqGqGqG', 'አድሚን ተስፋዬ', 'admin', true, CURRENT_TIMESTAMP),
(uuid_generate_v4(), 'manager', 'manager@ethernet.edu.et', '$2b$10$mQZ8kHp0rQZ8kHp0rQZ8kOeKqGqGqGqGqGqGqGqGqGqGqGqGqGqGqG', 'ማናጀር አበበ', 'manager', true, CURRENT_TIMESTAMP - INTERVAL '2 hours'),
(uuid_generate_v4(), 'operator', 'operator@ethernet.edu.et', '$2b$10$oQZ8kHp0rQZ8kHp0rQZ8kOeKqGqGqGqGqGqGqGqGqGqGqGqGqGqGqG', 'ኦፐሬተር ሰላም', 'operator', true, CURRENT_TIMESTAMP - INTERVAL '1 day');

-- Insert sample meal types
INSERT INTO meal_types (id, name, price, icon, enabled, color) VALUES
('breakfast', 'ቁርስ', 80.00, 'coffee', true, 'bg-amber-100 text-amber-700'),
('lunch', 'ምሳ', 150.00, 'utensils', true, 'bg-emerald-100 text-emerald-700'),
('dinner', 'እራት', 120.00, 'moon', true, 'bg-indigo-100 text-indigo-700'),
('snack', 'መክሰስ', 50.00, 'coffee', true, 'bg-orange-100 text-orange-700'),
('special', 'ልዩ ምግብ', 200.00, 'utensils', false, 'bg-purple-100 text-purple-700');

-- Insert sample employees
INSERT INTO employees (id, employee_id, card_id, short_code, name, department, photo_url, is_active) VALUES
(uuid_generate_v4(), 'EMP001', '04A2B3C4D5', '1234', 'አበበ ቢቂላ', 'ኢንጂነሪንግ', '/placeholder.svg?height=200&width=200&text=አበ', true),
(uuid_generate_v4(), 'EMP002', '15F6E7D8C9', '5678', 'ሰላም ታደሰ', 'ማርኬቲንግ', '/placeholder.svg?height=200&width=200&text=ሰላ', true),
(uuid_generate_v4(), 'EMP003', '26A7B8C9D0', '9012', 'ፍቃዱ ተስፋዬ', 'ፋይናንስ', '/placeholder.svg?height=200&width=200&text=ፍቃ', false),
(uuid_generate_v4(), 'EMP004', '37B8C9D0E1', '3456', 'ሄኖክ መንግስቱ', 'ሰው ሃይል', '/placeholder.svg?height=200&width=200&text=ሄኖ', true),
(uuid_generate_v4(), 'EMP005', '48C9D0E1F2', '7890', 'ብርሃን አለሙ', 'ኢንፎርሜሽን ቴክኖሎጂ', '/placeholder.svg?height=200&width=200&text=ብር', true),
(uuid_generate_v4(), 'EMP006', '59D0E1F2G3', '2345', 'ዳንኤል ገብሬ', 'ኢንጂነሪንግ', '/placeholder.svg?height=200&width=200&text=ዳን', true),
(uuid_generate_v4(), 'EMP007', '6AE1F2G3H4', '6789', 'ሳራ ወልደ', 'ማርኬቲንግ', '/placeholder.svg?height=200&width=200&text=ሳራ', true),
(uuid_generate_v4(), 'EMP008', '7BF2G3H4I5', '0123', 'ሙሉጌታ ተክሌ', 'ፋይናንስ', '/placeholder.svg?height=200&width=200&text=ሙሉ', false),
(uuid_generate_v4(), 'EMP009', '8CG3H4I5J6', '4567', 'ሄለን ዮሴፍ', 'ሰው ሃይል', '/placeholder.svg?height=200&width=200&text=ሄለ', true),
(uuid_generate_v4(), 'EMP010', '9DH4I5J6K7', '8901', 'ተስፋዬ አበራ', 'ኢንፎርሜሽን ቴክኖሎጂ', '/placeholder.svg?height=200&width=200&text=ተስ', true);

-- Insert sample meal records (last 30 days)
INSERT INTO meal_records (employee_id, card_id, meal_type_id, meal_name, price, recorded_at) VALUES
-- Today's records
('EMP001', '04A2B3C4D5', 'breakfast', 'ቁርስ', 80.00, CURRENT_TIMESTAMP - INTERVAL '2 hours'),
('EMP002', '15F6E7D8C9', 'breakfast', 'ቁርስ', 80.00, CURRENT_TIMESTAMP - INTERVAL '2 hours'),
('EMP004', '37B8C9D0E1', 'lunch', 'ምሳ', 150.00, CURRENT_TIMESTAMP - INTERVAL '30 minutes'),
('EMP005', '48C9D0E1F2', 'lunch', 'ምሳ', 150.00, CURRENT_TIMESTAMP - INTERVAL '25 minutes'),
('EMP006', '59D0E1F2G3', 'lunch', 'ምሳ', 150.00, CURRENT_TIMESTAMP - INTERVAL '20 minutes'),

-- Yesterday's records
('EMP001', '04A2B3C4D5', 'breakfast', 'ቁርስ', 80.00, CURRENT_TIMESTAMP - INTERVAL '1 day 2 hours'),
('EMP001', '04A2B3C4D5', 'lunch', 'ምሳ', 150.00, CURRENT_TIMESTAMP - INTERVAL '1 day 30 minutes'),
('EMP002', '15F6E7D8C9', 'breakfast', 'ቁርስ', 80.00, CURRENT_TIMESTAMP - INTERVAL '1 day 2 hours'),
('EMP002', '15F6E7D8C9', 'dinner', 'እራት', 120.00, CURRENT_TIMESTAMP - INTERVAL '1 day'),
('EMP004', '37B8C9D0E1', 'lunch', 'ምሳ', 150.00, CURRENT_TIMESTAMP - INTERVAL '1 day 30 minutes'),
('EMP005', '48C9D0E1F2', 'breakfast', 'ቁርስ', 80.00, CURRENT_TIMESTAMP - INTERVAL '1 day 2 hours'),
('EMP005', '48C9D0E1F2', 'lunch', 'ምሳ', 150.00, CURRENT_TIMESTAMP - INTERVAL '1 day 30 minutes'),
('EMP006', '59D0E1F2G3', 'lunch', 'ምሳ', 150.00, CURRENT_TIMESTAMP - INTERVAL '1 day 30 minutes'),
('EMP007', '6AE1F2G3H4', 'breakfast', 'ቁርስ', 80.00, CURRENT_TIMESTAMP - INTERVAL '1 day 2 hours'),
('EMP009', '8CG3H4I5J6', 'lunch', 'ምሳ', 150.00, CURRENT_TIMESTAMP - INTERVAL '1 day 30 minutes'),
('EMP010', '9DH4I5J6K7', 'breakfast', 'ቁርስ', 80.00, CURRENT_TIMESTAMP - INTERVAL '1 day 2 hours'),

-- 2 days ago
('EMP001', '04A2B3C4D5', 'breakfast', 'ቁርስ', 80.00, CURRENT_TIMESTAMP - INTERVAL '2 days 2 hours'),
('EMP001', '04A2B3C4D5', 'lunch', 'ምሳ', 150.00, CURRENT_TIMESTAMP - INTERVAL '2 days 30 minutes'),
('EMP002', '15F6E7D8C9', 'lunch', 'ምሳ', 150.00, CURRENT_TIMESTAMP - INTERVAL '2 days 30 minutes'),
('EMP004', '37B8C9D0E1', 'breakfast', 'ቁርስ', 80.00, CURRENT_TIMESTAMP - INTERVAL '2 days 2 hours'),
('EMP004', '37B8C9D0E1', 'lunch', 'ምሳ', 150.00, CURRENT_TIMESTAMP - INTERVAL '2 days 30 minutes'),
('EMP005', '48C9D0E1F2', 'lunch', 'ምሳ', 150.00, CURRENT_TIMESTAMP - INTERVAL '2 days 30 minutes'),
('EMP006', '59D0E1F2G3', 'breakfast', 'ቁርስ', 80.00, CURRENT_TIMESTAMP - INTERVAL '2 days 2 hours'),
('EMP007', '6AE1F2G3H4', 'lunch', 'ምሳ', 150.00, CURRENT_TIMESTAMP - INTERVAL '2 days 30 minutes'),
('EMP009', '8CG3H4I5J6', 'breakfast', 'ቁርስ', 80.00, CURRENT_TIMESTAMP - INTERVAL '2 days 2 hours'),
('EMP010', '9DH4I5J6K7', 'lunch', 'ምሳ', 150.00, CURRENT_TIMESTAMP - INTERVAL '2 days 30 minutes'),

-- 3 days ago
('EMP001', '04A2B3C4D5', 'breakfast', 'ቁርስ', 80.00, CURRENT_TIMESTAMP - INTERVAL '3 days 2 hours'),
('EMP002', '15F6E7D8C9', 'breakfast', 'ቁርስ', 80.00, CURRENT_TIMESTAMP - INTERVAL '3 days 2 hours'),
('EMP002', '15F6E7D8C9', 'lunch', 'ምሳ', 150.00, CURRENT_TIMESTAMP - INTERVAL '3 days 30 minutes'),
('EMP004', '37B8C9D0E1', 'lunch', 'ምሳ', 150.00, CURRENT_TIMESTAMP - INTERVAL '3 days 30 minutes'),
('EMP005', '48C9D0E1F2', 'breakfast', 'ቁርስ', 80.00, CURRENT_TIMESTAMP - INTERVAL '3 days 2 hours'),
('EMP006', '59D0E1F2G3', 'lunch', 'ምሳ', 150.00, CURRENT_TIMESTAMP - INTERVAL '3 days 30 minutes'),
('EMP007', '6AE1F2G3H4', 'breakfast', 'ቁርስ', 80.00, CURRENT_TIMESTAMP - INTERVAL '3 days 2 hours'),
('EMP007', '6AE1F2G3H4', 'dinner', 'እራት', 120.00, CURRENT_TIMESTAMP - INTERVAL '3 days'),
('EMP009', '8CG3H4I5J6', 'lunch', 'ምሳ', 150.00, CURRENT_TIMESTAMP - INTERVAL '3 days 30 minutes'),
('EMP010', '9DH4I5J6K7', 'breakfast', 'ቁርስ', 80.00, CURRENT_TIMESTAMP - INTERVAL '3 days 2 hours'),

-- Last week records
('EMP001', '04A2B3C4D5', 'breakfast', 'ቁርስ', 80.00, CURRENT_TIMESTAMP - INTERVAL '7 days 2 hours'),
('EMP001', '04A2B3C4D5', 'lunch', 'ምሳ', 150.00, CURRENT_TIMESTAMP - INTERVAL '7 days 30 minutes'),
('EMP002', '15F6E7D8C9', 'lunch', 'ምሳ', 150.00, CURRENT_TIMESTAMP - INTERVAL '7 days 30 minutes'),
('EMP004', '37B8C9D0E1', 'breakfast', 'ቁርስ', 80.00, CURRENT_TIMESTAMP - INTERVAL '7 days 2 hours'),
('EMP005', '48C9D0E1F2', 'lunch', 'ምሳ', 150.00, CURRENT_TIMESTAMP - INTERVAL '7 days 30 minutes'),
('EMP006', '59D0E1F2G3', 'breakfast', 'ቁርስ', 80.00, CURRENT_TIMESTAMP - INTERVAL '7 days 2 hours'),
('EMP007', '6AE1F2G3H4', 'lunch', 'ምሳ', 150.00, CURRENT_TIMESTAMP - INTERVAL '7 days 30 minutes'),
('EMP009', '8CG3H4I5J6', 'breakfast', 'ቁርስ', 80.00, CURRENT_TIMESTAMP - INTERVAL '7 days 2 hours'),
('EMP010', '9DH4I5J6K7', 'lunch', 'ምሳ', 150.00, CURRENT_TIMESTAMP - INTERVAL '7 days 30 minutes'),

-- Two weeks ago
('EMP001', '04A2B3C4D5', 'breakfast', 'ቁርስ', 80.00, CURRENT_TIMESTAMP - INTERVAL '14 days 2 hours'),
('EMP002', '15F6E7D8C9', 'lunch', 'ምሳ', 150.00, CURRENT_TIMESTAMP - INTERVAL '14 days 30 minutes'),
('EMP004', '37B8C9D0E1', 'breakfast', 'ቁርስ', 80.00, CURRENT_TIMESTAMP - INTERVAL '14 days 2 hours'),
('EMP005', '48C9D0E1F2', 'lunch', 'ምሳ', 150.00, CURRENT_TIMESTAMP - INTERVAL '14 days 30 minutes'),
('EMP006', '59D0E1F2G3', 'dinner', 'እራት', 120.00, CURRENT_TIMESTAMP - INTERVAL '14 days'),
('EMP007', '6AE1F2G3H4', 'breakfast', 'ቁርስ', 80.00, CURRENT_TIMESTAMP - INTERVAL '14 days 2 hours'),
('EMP009', '8CG3H4I5J6', 'lunch', 'ምሳ', 150.00, CURRENT_TIMESTAMP - INTERVAL '14 days 30 minutes'),
('EMP010', '9DH4I5J6K7', 'breakfast', 'ቁርስ', 80.00, CURRENT_TIMESTAMP - INTERVAL '14 days 2 hours');

-- Get admin user ID for coupon batch generation
DO $$
DECLARE
    admin_user_id UUID;
    manager_user_id UUID;
BEGIN
    -- Get admin and manager user IDs
    SELECT id INTO admin_user_id FROM users WHERE username = 'admin' LIMIT 1;
    SELECT id INTO manager_user_id FROM users WHERE username = 'manager' LIMIT 1;
    
    -- Insert sample coupon batches
    INSERT INTO coupon_batches (batch_number, title, meal_type_id, meal_type_name, total_coupons, color, generated_by_user_id, generated_by_name, is_active) VALUES
    ('BATCH-LX8K9M2P-A1B2', 'Staff Lunch Coupons - December', 'lunch', 'ምሳ', 50, 'bg-green-500', admin_user_id, 'አድሚን ተስፋዬ', true),
    ('BATCH-MN7J8K1O-C3D4', 'Guest Breakfast Vouchers', 'breakfast', 'ቁርስ', 25, 'bg-blue-500', manager_user_id, 'ማናጀር አበበ', true),
    ('BATCH-OP6I7J0N-E5F6', 'Special Event Dinner', 'dinner', 'እራት', 30, 'bg-purple-500', admin_user_id, 'አድሚን ተስፋዬ', false);
    
    -- Insert sample coupons for the first batch (lunch coupons)
    INSERT INTO coupons (code, batch_number, title, meal_type_id, meal_type_name, is_used, is_active, color, generated_by_user_id, generated_by_name, used_by_employee_id, used_at) VALUES
    ('LCH001A1', 'BATCH-LX8K9M2P-A1B2', 'Staff Lunch Coupons - December', 'lunch', 'ምሳ', true, true, 'bg-green-500', admin_user_id, 'አድሚን ተስፋዬ', 'EMP001', CURRENT_TIMESTAMP - INTERVAL '2 days'),
    ('LCH002B2', 'BATCH-LX8K9M2P-A1B2', 'Staff Lunch Coupons - December', 'lunch', 'ምሳ', true, true, 'bg-green-500', admin_user_id, 'አድሚን ተስፋዬ', 'EMP002', CURRENT_TIMESTAMP - INTERVAL '1 day'),
    ('LCH003C3', 'BATCH-LX8K9M2P-A1B2', 'Staff Lunch Coupons - December', 'lunch', 'ምሳ', false, true, 'bg-green-500', admin_user_id, 'አድሚን ተስፋዬ', NULL, NULL),
    ('LCH004D4', 'BATCH-LX8K9M2P-A1B2', 'Staff Lunch Coupons - December', 'lunch', 'ምሳ', false, true, 'bg-green-500', admin_user_id, 'አድሚን ተስፋዬ', NULL, NULL),
    ('LCH005E5', 'BATCH-LX8K9M2P-A1B2', 'Staff Lunch Coupons - December', 'lunch', 'ምሳ', false, true, 'bg-green-500', admin_user_id, 'አድሚን ተስፋዬ', NULL, NULL);
    
    -- Insert sample coupons for the second batch (breakfast coupons)
    INSERT INTO coupons (code, batch_number, title, meal_type_id, meal_type_name, is_used, is_active, color, generated_by_user_id, generated_by_name) VALUES
    ('BRK001F6', 'BATCH-MN7J8K1O-C3D4', 'Guest Breakfast Vouchers', 'breakfast', 'ቁርስ', false, true, 'bg-blue-500', manager_user_id, 'ማናጀር አበበ'),
    ('BRK002G7', 'BATCH-MN7J8K1O-C3D4', 'Guest Breakfast Vouchers', 'breakfast', 'ቁርስ', false, true, 'bg-blue-500', manager_user_id, 'ማናጀር አበበ'),
    ('BRK003H8', 'BATCH-MN7J8K1O-C3D4', 'Guest Breakfast Vouchers', 'breakfast', 'ቁርስ', false, true, 'bg-blue-500', manager_user_id, 'ማናጀር አበበ');
    
    -- Insert sample coupons for the third batch (dinner coupons - inactive)
    INSERT INTO coupons (code, batch_number, title, meal_type_id, meal_type_name, is_used, is_active, color, generated_by_user_id, generated_by_name) VALUES
    ('DIN001I9', 'BATCH-OP6I7J0N-E5F6', 'Special Event Dinner', 'dinner', 'እራት', false, false, 'bg-purple-500', admin_user_id, 'አድሚን ተስፋዬ'),
    ('DIN002J0', 'BATCH-OP6I7J0N-E5F6', 'Special Event Dinner', 'dinner', 'እራት', false, false, 'bg-purple-500', admin_user_id, 'አድሚን ተስፋዬ');
    
END $$;
