-- Comprehensive sample queries for the enhanced support system

-- 1. Daily support summary for today
SELECT * FROM daily_support_summary 
WHERE meal_date = CURRENT_DATE
ORDER BY meal_type_id, category;

-- 2. Check employee support eligibility
SELECT 
    employee_id,
    name,
    salary,
    support_status,
    eligible_for_support
FROM employee_support_eligibility
WHERE is_active = true
ORDER BY salary ASC;

-- 3. Get pricing for a specific employee and meal
SELECT * FROM get_meal_pricing('EMP001', 
    (SELECT id FROM meal_categories WHERE meal_type_id = 'lunch' AND category = 'fasting')
);

-- 4. Record a meal transaction (example)
SELECT * FROM record_meal_transaction(
    'EMP003', 
    '26A7B8C9D0', 
    (SELECT id FROM meal_categories WHERE meal_type_id = 'breakfast' AND category = 'non_fasting')
);

-- 5. Monthly support financial summary for current month
SELECT * FROM monthly_support_financial_summary 
WHERE month = DATE_TRUNC('month', CURRENT_DATE)
ORDER BY meal_type_id, category;

-- 6. Department support analysis
SELECT * FROM department_support_analysis
ORDER BY eligibility_percentage DESC;

-- 7. Meal category popularity and support analysis
SELECT * FROM meal_category_support_analysis
ORDER BY support_usage_percentage DESC;

-- 8. Weekly support trends for last 8 weeks
SELECT * FROM weekly_support_trends
WHERE week_start >= CURRENT_DATE - INTERVAL '8 weeks'
ORDER BY week_start DESC;

-- 9. Top 10 employees receiving most support
SELECT * FROM employee_support_summary
WHERE support_eligibility = 'Eligible'
ORDER BY total_subsidy_received DESC
LIMIT 10;

-- 10. Generate comprehensive support report for last month
SELECT * FROM generate_support_report(
    DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::DATE,
    (DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 day')::DATE
);

-- 11. Get detailed support stats for specific employee
SELECT * FROM get_employee_support_stats('EMP001');

-- 12. Compare fasting vs non-fasting meal consumption
SELECT 
    category,
    COUNT(*) as total_orders,
    COUNT(CASE WHEN price_type = 'supported' THEN 1 END) as supported_orders,
    SUM(actual_price) as total_revenue,
    SUM(support_amount) as total_subsidy,
    ROUND(AVG(actual_price), 2) as avg_price,
    ROUND(
        COUNT(CASE WHEN price_type = 'supported' THEN 1 END) * 100.0 / COUNT(*), 2
    ) as support_percentage
FROM meal_records
GROUP BY category
ORDER BY category;

-- 13. Daily subsidy cost analysis
SELECT 
    DATE(recorded_at) as date,
    SUM(support_amount) as daily_subsidy_cost,
    COUNT(CASE WHEN price_type = 'supported' THEN 1 END) as supported_meals,
    ROUND(AVG(support_amount), 2) as avg_subsidy_per_meal
FROM meal_records
WHERE recorded_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(recorded_at)
ORDER BY date DESC;

-- 14. Employees who are eligible but not using support
SELECT 
    e.employee_id,
    e.name,
    e.department,
    e.salary,
    COUNT(mr.id) as total_meals,
    COUNT(CASE WHEN mr.price_type = 'supported' THEN 1 END) as supported_meals,
    COUNT(CASE WHEN mr.price_type = 'normal' THEN 1 END) as normal_meals
FROM employees e
LEFT JOIN meal_records mr ON e.employee_id = mr.employee_id 
    AND mr.recorded_at >= CURRENT_DATE - INTERVAL '30 days'
WHERE e.is_active = true 
    AND is_eligible_for_support(e.employee_id) = true
GROUP BY e.employee_id, e.name, e.department, e.salary
HAVING COUNT(CASE WHEN mr.price_type = 'normal' THEN 1 END) > 0
ORDER BY normal_meals DESC;

-- 15. Peak support usage hours
SELECT 
    EXTRACT(HOUR FROM recorded_at) as hour,
    COUNT(*) as total_meals,
    COUNT(CASE WHEN price_type = 'supported' THEN 1 END) as supported_meals,
    SUM(support_amount) as hourly_subsidy,
    ROUND(
        COUNT(CASE WHEN price_type = 'supported' THEN 1 END) * 100.0 / COUNT(*), 2
    ) as support_percentage
FROM meal_records
WHERE DATE(recorded_at) >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY EXTRACT(HOUR FROM recorded_at)
ORDER BY hour;

-- 16. Support impact by salary ranges
SELECT 
    CASE 
        WHEN e.salary < 3000 THEN 'Under 3000'
        WHEN e.salary < 4000 THEN '3000-3999'
        WHEN e.salary < 5000 THEN '4000-4999'
        WHEN e.salary < 6000 THEN '5000-5999'
        ELSE '6000+'
    END as salary_range,
    COUNT(DISTINCT e.employee_id) as employees,
    COUNT(mr.id) as total_meals,
    COUNT(CASE WHEN mr.price_type = 'supported' THEN 1 END) as supported_meals,
    SUM(mr.support_amount) as total_subsidy
FROM employees e
LEFT JOIN meal_records mr ON e.employee_id = mr.employee_id
WHERE e.salary IS NOT NULL
GROUP BY 
    CASE 
        WHEN e.salary < 3000 THEN 'Under 3000'
        WHEN e.salary < 4000 THEN '3000-3999'
        WHEN e.salary < 5000 THEN '4000-4999'
        WHEN e.salary < 6000 THEN '5000-5999'
        ELSE '6000+'
    END
ORDER BY MIN(e.salary);

-- 17. Monthly budget projection for support program
SELECT 
    DATE_TRUNC('month', CURRENT_DATE + INTERVAL '1 month') as projected_month,
    AVG(daily_subsidy) * 30 as projected_monthly_subsidy,
    AVG(daily_supported_meals) * 30 as projected_supported_meals
FROM (
    SELECT 
        DATE(recorde
