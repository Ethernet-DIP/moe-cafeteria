-- Enhanced functions for support system management

-- Function to check if employee is eligible for support
CREATE OR REPLACE FUNCTION is_eligible_for_support(p_employee_id VARCHAR(50))
RETURNS BOOLEAN AS $$
DECLARE
    employee_salary DECIMAL(10,2);
    max_salary DECIMAL(10,2);
BEGIN
    -- Get employee salary
    SELECT salary INTO employee_salary 
    FROM employees 
    WHERE employee_id = p_employee_id AND is_active = true;
    
    -- Get current support threshold
    SELECT max_salary_for_support INTO max_salary 
    FROM support_config 
    WHERE is_active = true 
    LIMIT 1;
    
    -- Return eligibility
    RETURN (employee_salary IS NOT NULL AND employee_salary < max_salary);
END;
$$ LANGUAGE plpgsql;

-- Function to get meal pricing for employee
CREATE OR REPLACE FUNCTION get_meal_pricing(
    p_employee_id VARCHAR(50),
    p_meal_category_id UUID
) RETURNS TABLE (
    normal_price DECIMAL(10,2),
    supported_price DECIMAL(10,2),
    applicable_price DECIMAL(10,2),
    price_type price_type,
    support_amount DECIMAL(10,2),
    eligible_for_support BOOLEAN
) AS $$
DECLARE
    v_normal_price DECIMAL(10,2);
    v_supported_price DECIMAL(10,2);
    v_eligible BOOLEAN;
BEGIN
    -- Get meal category pricing
    SELECT mc.normal_price, mc.supported_price
    INTO v_normal_price, v_supported_price
    FROM meal_categories mc
    WHERE mc.id = p_meal_category_id AND mc.enabled = true;
    
    -- Check if prices were found
    IF v_normal_price IS NULL THEN
        RETURN;
    END IF;
    
    -- Check eligibility
    v_eligible := is_eligible_for_support(p_employee_id);
    
    -- Return pricing information
    IF v_eligible THEN
        RETURN QUERY SELECT 
            v_normal_price,
            v_supported_price,
            v_supported_price as applicable_price,
            'supported'::price_type,
            v_normal_price - v_supported_price as support_amount,
            true as eligible_for_support;
    ELSE
        RETURN QUERY SELECT 
            v_normal_price,
            v_supported_price,
            v_normal_price as applicable_price,
            'normal'::price_type,
            0.00 as support_amount,
            false as eligible_for_support;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to record meal with automatic pricing
CREATE OR REPLACE FUNCTION record_meal_transaction(
    p_employee_id VARCHAR(50),
    p_card_id VARCHAR(100),
    p_meal_category_id UUID
) RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    meal_record_id UUID,
    actual_price DECIMAL(10,2),
    support_amount DECIMAL(10,2)
) AS $$
DECLARE
    v_meal_record_id UUID;
    v_employee_salary DECIMAL(10,2);
    v_meal_type_id VARCHAR(50);
    v_meal_name VARCHAR(100);
    v_category meal_category;
    v_normal_price DECIMAL(10,2);
    v_supported_price DECIMAL(10,2);
    v_applicable_price DECIMAL(10,2);
    v_price_type price_type;
    v_support_amount DECIMAL(10,2);
    v_eligible BOOLEAN;
    v_already_used BOOLEAN;
BEGIN
    -- Check if employee exists and is active
    SELECT salary INTO v_employee_salary
    FROM employees
    WHERE employee_id = p_employee_id AND is_active = true;
    
    IF v_employee_salary IS NULL THEN
        RETURN QUERY SELECT false, 'Employee not found or inactive'::TEXT, NULL::UUID, 0.00, 0.00;
        RETURN;
    END IF;
    
    -- Get meal category details
    SELECT mc.meal_type_id, mc.name, mc.category, mc.normal_price, mc.supported_price
    INTO v_meal_type_id, v_meal_name, v_category, v_normal_price, v_supported_price
    FROM meal_categories mc
    WHERE mc.id = p_meal_category_id AND mc.enabled = true;
    
    IF v_meal_type_id IS NULL THEN
        RETURN QUERY SELECT false, 'Meal category not found or disabled'::TEXT, NULL::UUID, 0.00, 0.00;
        RETURN;
    END IF;
    
    -- Check if employee has already used this meal type today
    SELECT EXISTS(
        SELECT 1 FROM meal_records 
        WHERE employee_id = p_employee_id 
        AND meal_type_id = v_meal_type_id 
        AND DATE(recorded_at) = CURRENT_DATE
    ) INTO v_already_used;
    
    IF v_already_used THEN
        RETURN QUERY SELECT false, 'Employee has already used this meal type today'::TEXT, NULL::UUID, 0.00, 0.00;
        RETURN;
    END IF;
    
    -- Determine pricing
    v_eligible := is_eligible_for_support(p_employee_id);
    
    IF v_eligible THEN
        v_applicable_price := v_supported_price;
        v_price_type := 'supported';
        v_support_amount := v_normal_price - v_supported_price;
    ELSE
        v_applicable_price := v_normal_price;
        v_price_type := 'normal';
        v_support_amount := 0.00;
    END IF;
    
    -- Insert meal record
    INSERT INTO meal_records (
        employee_id, card_id, meal_type_id, meal_category_id, meal_name, 
        category, price_type, normal_price, supported_price, actual_price, 
        support_amount, employee_salary
    ) VALUES (
        p_employee_id, p_card_id, v_meal_type_id, p_meal_category_id, v_meal_name,
        v_category, v_price_type, v_normal_price, v_supported_price, v_applicable_price,
        v_support_amount, v_employee_salary
    ) RETURNING id INTO v_meal_record_id;
    
    RETURN QUERY SELECT true, 'Meal recorded successfully'::TEXT, v_meal_record_id, v_applicable_price, v_support_amount;
END;
$$ LANGUAGE plpgsql;

-- Function to generate comprehensive support report
CREATE OR REPLACE FUNCTION generate_support_report(
    p_start_date DATE,
    p_end_date DATE
) RETURNS TABLE (
    report_period TEXT,
    total_meals BIGINT,
    supported_meals BIGINT,
    normal_meals BIGINT,
    total_revenue DECIMAL(10,2),
    total_subsidy DECIMAL(10,2),
    potential_revenue DECIMAL(10,2),
    supported_employees BIGINT,
    total_employees BIGINT,
    avg_subsidy_per_meal DECIMAL(10,2),
    support_percentage DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p_start_date::TEXT || ' to ' || p_end_date::TEXT as report_period,
        COUNT(*) as total_meals,
        COUNT(CASE WHEN price_type = 'supported' THEN 1 END) as supported_meals,
        COUNT(CASE WHEN price_type = 'normal' THEN 1 END) as normal_meals,
        SUM(actual_price) as total_revenue,
        SUM(support_amount) as total_subsidy,
        SUM(normal_price) as potential_revenue,
        COUNT(DISTINCT CASE WHEN price_type = 'supported' THEN employee_id END) as supported_employees,
        COUNT(DISTINCT employee_id) as total_employees,
        ROUND(AVG(CASE WHEN price_type = 'supported' THEN support_amount END), 2) as avg_subsidy_per_meal,
        ROUND(
            COUNT(CASE WHEN price_type = 'supported' THEN 1 END) * 100.0 / COUNT(*), 2
        ) as support_percentage
    FROM meal_records
    WHERE DATE(recorded_at) BETWEEN p_start_date AND p_end_date;
END;
$$ LANGUAGE plpgsql;

-- Function to get employee support statistics
CREATE OR REPLACE FUNCTION get_employee_support_stats(p_employee_id VARCHAR(50))
RETURNS TABLE (
    employee_name VARCHAR(255),
    department VARCHAR(100),
    salary DECIMAL(10,2),
    eligible_for_support BOOLEAN,
    total_meals BIGINT,
    supported_meals BIGINT,
    total_paid DECIMAL(10,2),
    total_subsidy DECIMAL(10,2),
    total_savings DECIMAL(10,2),
    avg_meal_cost DECIMAL(10,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.name as employee_name,
        e.department,
        e.salary,
        is_eligible_for_support(e.employee_id) as eligible_for_support,
        COUNT(mr.id) as total_meals,
        COUNT(CASE WHEN mr.price_type = 'supported' THEN 1 END) as supported_meals,
        COALESCE(SUM(mr.actual_price), 0) as total_paid,
        COALESCE(SUM(mr.support_amount), 0) as total_subsidy,
        COALESCE(SUM(mr.normal_price) - SUM(mr.actual_price), 0) as total_savings,
        COALESCE(AVG(mr.actual_price), 0) as avg_meal_cost
    FROM employees e
    LEFT JOIN meal_records mr ON e.employee_id = mr.employee_id
    WHERE e.employee_id = p_employee_id
    GROUP BY e.employee_id, e.name, e.department, e.salary;
END;
$$ LANGUAGE plpgsql;

-- Function to update support threshold
CREATE OR REPLACE FUNCTION update_support_threshold(p_new_threshold DECIMAL(10,2))
RETURNS BOOLEAN AS $$
BEGIN
    -- Deactivate current config
    UPDATE support_config SET is_active = false;
    
    -- Insert new config
    INSERT INTO support_config (max_salary_for_support, is_active)
    VALUES (p_new_threshold, true);
    
    RETURN true;
END;
$$ LANGUAGE plpgsql;
