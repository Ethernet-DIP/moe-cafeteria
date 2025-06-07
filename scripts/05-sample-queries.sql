-- Sample queries for testing and demonstration

-- 1. Get today's meal consumption
SELECT 
    meal_type_id,
    meal_name,
    COUNT(*) as meals_served,
    SUM(price) as revenue
FROM meal_records 
WHERE DATE(recorded_at) = CURRENT_DATE
GROUP BY meal_type_id, meal_name
ORDER BY meals_served DESC;

-- 2. Get employee meal usage for last 7 days
SELECT 
    e.employee_id,
    e.name,
    e.department,
    COUNT(mr.id) as meals_this_week,
    SUM(mr.price) as spent_this_week
FROM employees e
LEFT JOIN meal_records mr ON e.employee_id = mr.employee_id 
    AND mr.recorded_at >= CURRENT_DATE - INTERVAL '7 days'
WHERE e.is_active = true
GROUP BY e.employee_id, e.name, e.department
ORDER BY meals_this_week DESC;

-- 3. Check if specific employee can have lunch today
SELECT 
    e.name,
    e.employee_id,
    has_used_meal_today(e.employee_id, 'lunch') as already_had_lunch
FROM employees e 
WHERE e.employee_id = 'EMP001';

-- 4. Get meal statistics for an employee
SELECT * FROM get_employee_meal_stats('EMP001');

-- 5. Get daily meal summary for last week
SELECT * FROM daily_meal_summary 
WHERE meal_date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY meal_date DESC, meal_type_id;

-- 6. Get department-wise consumption for current month
SELECT 
    department,
    COUNT(*) as total_meals,
    SUM(mr.price) as total_spent,
    COUNT(DISTINCT e.employee_id) as active_employees
FROM employees e
JOIN meal_records mr ON e.employee_id = mr.employee_id
WHERE DATE_TRUNC('month', mr.recorded_at) = DATE_TRUNC('month', CURRENT_DATE)
GROUP BY department
ORDER BY total_meals DESC;

-- 7. Get coupon usage summary
SELECT * FROM coupon_usage_summary;

-- 8. Find unused coupons that are still active
SELECT 
    code,
    title,
    meal_type_name,
    batch_number,
    generated_by_name,
    created_at
FROM coupons 
WHERE is_used = false 
AND is_active = true
ORDER BY created_at DESC;

-- 9. Get meal usage report for last month
SELECT * FROM get_meal_usage_report(
    DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::DATE,
    (DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 day')::DATE
);

-- 10. Get top 5 consuming employees this month
SELECT * FROM get_top_consuming_employees(
    5,
    DATE_TRUNC('month', CURRENT_DATE)::DATE,
    CURRENT_DATE
);

-- 11. Get employees who haven't eaten in the last 7 days
SELECT 
    e.employee_id,
    e.name,
    e.department,
    MAX(mr.recorded_at) as last_meal_date
FROM employees e
LEFT JOIN meal_records mr ON e.employee_id = mr.employee_id
WHERE e.is_active = true
GROUP BY e.employee_id, e.name, e.department
HAVING MAX(mr.recorded_at) < CURRENT_DATE - INTERVAL '7 days' 
    OR MAX(mr.recorded_at) IS NULL
ORDER BY last_meal_date ASC NULLS FIRST;

-- 12. Get hourly meal distribution for today
SELECT 
    EXTRACT(HOUR FROM recorded_at) as hour,
    meal_type_id,
    COUNT(*) as meals_served
FROM meal_records 
WHERE DATE(recorded_at) = CURRENT_DATE
GROUP BY EXTRACT(HOUR FROM recorded_at), meal_type_id
ORDER BY hour, meal_type_id;

-- 13. Validate a coupon (example)
SELECT * FROM use_coupon('LCH003C3', 'EMP005');

-- 14. Get revenue trend for last 30 days
SELECT 
    DATE(recorded_at) as date,
    COUNT(*) as total_meals,
    SUM(price) as daily_revenue
FROM meal_records 
WHERE recorded_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(recorded_at)
ORDER BY date DESC;

-- 15. Get meal type popularity
SELECT 
    meal_type_id,
    meal_name,
    COUNT(*) as times_ordered,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM meal_records
GROUP BY meal_type_id, meal_name
ORDER BY times_ordered DESC;
