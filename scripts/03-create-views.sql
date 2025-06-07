-- Create useful views for reporting and analytics

-- Daily meal summary view
CREATE OR REPLACE VIEW daily_meal_summary AS
SELECT 
    DATE(recorded_at) as meal_date,
    meal_type_id,
    meal_name,
    COUNT(*) as total_meals,
    SUM(price) as total_revenue,
    COUNT(DISTINCT employee_id) as unique_employees
FROM meal_records
GROUP BY DATE(recorded_at), meal_type_id, meal_name
ORDER BY meal_date DESC, meal_type_id;

-- Employee meal usage summary view
CREATE OR REPLACE VIEW employee_meal_summary AS
SELECT 
    e.employee_id,
    e.name,
    e.department,
    e.is_active,
    COUNT(mr.id) as total_meals,
    SUM(mr.price) as total_spent,
    COUNT(DISTINCT mr.meal_type_id) as meal_types_used,
    MAX(mr.recorded_at) as last_meal_date
FROM employees e
LEFT JOIN meal_records mr ON e.employee_id = mr.employee_id
GROUP BY e.employee_id, e.name, e.department, e.is_active
ORDER BY total_meals DESC;

-- Monthly revenue summary view
CREATE OR REPLACE VIEW monthly_revenue_summary AS
SELECT 
    DATE_TRUNC('month', recorded_at) as month,
    meal_type_id,
    meal_name,
    COUNT(*) as total_meals,
    SUM(price) as total_revenue,
    COUNT(DISTINCT employee_id) as unique_employees
FROM meal_records
GROUP BY DATE_TRUNC('month', recorded_at), meal_type_id, meal_name
ORDER BY month DESC, meal_type_id;

-- Coupon usage summary view
CREATE OR REPLACE VIEW coupon_usage_summary AS
SELECT 
    cb.batch_number,
    cb.title,
    cb.meal_type_name,
    cb.total_coupons,
    COUNT(c.id) as generated_coupons,
    COUNT(CASE WHEN c.is_used THEN 1 END) as used_coupons,
    COUNT(CASE WHEN NOT c.is_used AND c.is_active THEN 1 END) as available_coupons,
    cb.generated_by_name,
    cb.created_at as batch_created_at,
    cb.is_active as batch_active
FROM coupon_batches cb
LEFT JOIN coupons c ON cb.batch_number = c.batch_number
GROUP BY cb.batch_number, cb.title, cb.meal_type_name, cb.total_coupons, 
         cb.generated_by_name, cb.created_at, cb.is_active
ORDER BY cb.created_at DESC;

-- Department meal consumption view
CREATE OR REPLACE VIEW department_meal_consumption AS
SELECT 
    e.department,
    DATE(mr.recorded_at) as meal_date,
    mr.meal_type_id,
    mr.meal_name,
    COUNT(*) as total_meals,
    SUM(mr.price) as total_spent,
    COUNT(DISTINCT e.employee_id) as employees_participated
FROM employees e
JOIN meal_records mr ON e.employee_id = mr.employee_id
GROUP BY e.department, DATE(mr.recorded_at), mr.meal_type_id, mr.meal_name
ORDER BY meal_date DESC, e.department, mr.meal_type_id;
