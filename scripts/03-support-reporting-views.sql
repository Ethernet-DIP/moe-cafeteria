-- Create comprehensive views for support reporting and analytics

-- Daily support summary view
CREATE OR REPLACE VIEW daily_support_summary AS
SELECT 
    DATE(recorded_at) as meal_date,
    meal_type_id,
    category,
    meal_name,
    COUNT(*) as total_meals,
    COUNT(CASE WHEN price_type = 'supported' THEN 1 END) as supported_meals,
    COUNT(CASE WHEN price_type = 'normal' THEN 1 END) as normal_meals,
    SUM(actual_price) as total_revenue,
    SUM(support_amount) as total_support_amount,
    SUM(normal_price) as total_normal_value,
    COUNT(DISTINCT CASE WHEN price_type = 'supported' THEN employee_id END) as supported_employees,
    COUNT(DISTINCT employee_id) as total_employees
FROM meal_records
GROUP BY DATE(recorded_at), meal_type_id, category, meal_name
ORDER BY meal_date DESC, meal_type_id, category;

-- Employee support eligibility view
CREATE OR REPLACE VIEW employee_support_eligibility AS
SELECT 
    e.employee_id,
    e.name,
    e.department,
    e.salary,
    e.is_active,
    sc.max_salary_for_support,
    CASE 
        WHEN e.salary IS NULL THEN false
        WHEN e.salary < sc.max_salary_for_support THEN true 
        ELSE false 
    END as eligible_for_support,
    CASE 
        WHEN e.salary IS NULL THEN 'No salary information'
        WHEN e.salary < sc.max_salary_for_support THEN 'Eligible' 
        ELSE 'Not eligible' 
    END as support_status
FROM employees e
CROSS JOIN support_config sc
WHERE sc.is_active = true
ORDER BY e.salary ASC NULLS LAST;

-- Monthly support financial summary
CREATE OR REPLACE VIEW monthly_support_financial_summary AS
SELECT 
    DATE_TRUNC('month', recorded_at) as month,
    meal_type_id,
    category,
    COUNT(*) as total_meals,
    COUNT(CASE WHEN price_type = 'supported' THEN 1 END) as supported_meals,
    COUNT(CASE WHEN price_type = 'normal' THEN 1 END) as normal_meals,
    
    -- Revenue calculations
    SUM(actual_price) as actual_revenue,
    SUM(normal_price) as potential_revenue,
    SUM(support_amount) as total_subsidy,
    
    -- Average prices
    AVG(CASE WHEN price_type = 'supported' THEN actual_price END) as avg_supported_price,
    AVG(CASE WHEN price_type = 'normal' THEN actual_price END) as avg_normal_price,
    
    -- Employee counts
    COUNT(DISTINCT CASE WHEN price_type = 'supported' THEN employee_id END) as unique_supported_employees,
    COUNT(DISTINCT employee_id) as total_unique_employees,
    
    -- Percentages
    ROUND(
        COUNT(CASE WHEN price_type = 'supported' THEN 1 END) * 100.0 / COUNT(*), 2
    ) as support_percentage
FROM meal_records
GROUP BY DATE_TRUNC('month', recorded_at), meal_type_id, category
ORDER BY month DESC, meal_type_id, category;

-- Department support analysis view
CREATE OR REPLACE VIEW department_support_analysis AS
SELECT 
    e.department,
    COUNT(DISTINCT e.employee_id) as total_employees,
    COUNT(DISTINCT CASE WHEN e.salary < sc.max_salary_for_support THEN e.employee_id END) as eligible_employees,
    COUNT(DISTINCT CASE WHEN mr.price_type = 'supported' THEN mr.employee_id END) as employees_using_support,
    
    -- Meal statistics
    COUNT(mr.id) as total_meals,
    COUNT(CASE WHEN mr.price_type = 'supported' THEN 1 END) as supported_meals,
    
    -- Financial statistics
    COALESCE(SUM(mr.actual_price), 0) as total_revenue,
    COALESCE(SUM(mr.support_amount), 0) as total_subsidy,
    COALESCE(AVG(e.salary), 0) as avg_department_salary,
    
    -- Percentages
    ROUND(
        COUNT(DISTINCT CASE WHEN e.salary < sc.max_salary_for_support THEN e.employee_id END) * 100.0 / 
        NULLIF(COUNT(DISTINCT e.employee_id), 0), 2
    ) as eligibility_percentage
FROM employees e
CROSS JOIN support_config sc
LEFT JOIN meal_records mr ON e.employee_id = mr.employee_id
WHERE sc.is_active = true
GROUP BY e.department
ORDER BY eligibility_percentage DESC, total_employees DESC;

-- Meal category popularity and support view
CREATE OR REPLACE VIEW meal_category_support_analysis AS
SELECT 
    mc.meal_type_id,
    mc.category,
    mc.name as meal_name,
    mc.normal_price,
    mc.supported_price,
    mc.normal_price - mc.supported_price as subsidy_per_meal,
    
    -- Usage statistics
    COUNT(mr.id) as total_orders,
    COUNT(CASE WHEN mr.price_type = 'supported' THEN 1 END) as supported_orders,
    COUNT(CASE WHEN mr.price_type = 'normal' THEN 1 END) as normal_orders,
    
    -- Financial impact
    SUM(mr.actual_price) as total_revenue,
    SUM(mr.support_amount) as total_subsidy,
    SUM(mr.normal_price) as potential_full_revenue,
    
    -- Averages and percentages
    ROUND(
        COUNT(CASE WHEN mr.price_type = 'supported' THEN 1 END) * 100.0 / 
        NULLIF(COUNT(mr.id), 0), 2
    ) as support_usage_percentage,
    
    COUNT(DISTINCT CASE WHEN mr.price_type = 'supported' THEN mr.employee_id END) as unique_supported_users
FROM meal_categories mc
LEFT JOIN meal_records mr ON mc.id = mr.meal_category_id
WHERE mc.enabled = true
GROUP BY mc.meal_type_id, mc.category, mc.name, mc.normal_price, mc.supported_price
ORDER BY total_orders DESC;

-- Weekly support trend view
CREATE OR REPLACE VIEW weekly_support_trends AS
SELECT 
    DATE_TRUNC('week', recorded_at) as week_start,
    COUNT(*) as total_meals,
    COUNT(CASE WHEN price_type = 'supported' THEN 1 END) as supported_meals,
    SUM(actual_price) as total_revenue,
    SUM(support_amount) as total_subsidy,
    COUNT(DISTINCT CASE WHEN price_type = 'supported' THEN employee_id END) as supported_employees,
    COUNT(DISTINCT employee_id) as total_employees,
    
    -- Percentages
    ROUND(
        COUNT(CASE WHEN price_type = 'supported' THEN 1 END) * 100.0 / COUNT(*), 2
    ) as support_meal_percentage,
    
    ROUND(
        SUM(support_amount) * 100.0 / SUM(normal_price), 2
    ) as subsidy_percentage
FROM meal_records
GROUP BY DATE_TRUNC('week', recorded_at)
ORDER BY week_start DESC;

-- Employee individual support summary
CREATE OR REPLACE VIEW employee_support_summary AS
SELECT 
    e.employee_id,
    e.name,
    e.department,
    e.salary,
    CASE 
        WHEN e.salary < sc.max_salary_for_support THEN 'Eligible' 
        ELSE 'Not Eligible' 
    END as support_eligibility,
    
    -- Meal statistics
    COUNT(mr.id) as total_meals,
    COUNT(CASE WHEN mr.price_type = 'supported' THEN 1 END) as supported_meals,
    COUNT(CASE WHEN mr.price_type = 'normal' THEN 1 END) as normal_meals,
    
    -- Financial statistics
    COALESCE(SUM(mr.actual_price), 0) as total_paid,
    COALESCE(SUM(mr.support_amount), 0) as total_subsidy_received,
    COALESCE(SUM(mr.normal_price), 0) as total_normal_value,
    
    -- Savings
    COALESCE(SUM(mr.normal_price) - SUM(mr.actual_price), 0) as total_savings,
    
    -- Last meal info
    MAX(mr.recorded_at) as last_meal_date
FROM employees e
CROSS JOIN support_config sc
LEFT JOIN meal_records mr ON e.employee_id = mr.employee_id
WHERE sc.is_active = true AND e.is_active = true
GROUP BY e.employee_id, e.name, e.department, e.salary, sc.max_salary_for_support
ORDER BY total_subsidy_received DESC;
