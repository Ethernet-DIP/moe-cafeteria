-- Useful stored functions for the cafeteria management system

-- Function to check if employee has already used a meal type today
CREATE OR REPLACE FUNCTION has_used_meal_today(
    p_employee_id VARCHAR(50),
    p_meal_type_id VARCHAR(50)
) RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM meal_records 
        WHERE employee_id = p_employee_id 
        AND meal_type_id = p_meal_type_id 
        AND DATE(recorded_at) = CURRENT_DATE
    );
END;
$$ LANGUAGE plpgsql;

-- Function to get employee meal statistics
CREATE OR REPLACE FUNCTION get_employee_meal_stats(p_employee_id VARCHAR(50))
RETURNS TABLE (
    total_meals BIGINT,
    total_amount DECIMAL(10,2),
    breakfast_count BIGINT,
    lunch_count BIGINT,
    dinner_count BIGINT,
    last_meal_date TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_meals,
        COALESCE(SUM(price), 0) as total_amount,
        COUNT(CASE WHEN meal_type_id = 'breakfast' THEN 1 END) as breakfast_count,
        COUNT(CASE WHEN meal_type_id = 'lunch' THEN 1 END) as lunch_count,
        COUNT(CASE WHEN meal_type_id = 'dinner' THEN 1 END) as dinner_count,
        MAX(recorded_at) as last_meal_date
    FROM meal_records 
    WHERE employee_id = p_employee_id;
END;
$$ LANGUAGE plpgsql;

-- Function to validate and use a coupon
CREATE OR REPLACE FUNCTION use_coupon(
    p_coupon_code VARCHAR(20),
    p_employee_id VARCHAR(50) DEFAULT NULL
) RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    coupon_id UUID,
    meal_type_id VARCHAR(50),
    meal_type_name VARCHAR(100)
) AS $$
DECLARE
    v_coupon_id UUID;
    v_meal_type_id VARCHAR(50);
    v_meal_type_name VARCHAR(100);
    v_is_used BOOLEAN;
    v_is_active BOOLEAN;
BEGIN
    -- Check if coupon exists and get details
    SELECT id, meal_type_id, meal_type_name, is_used, is_active
    INTO v_coupon_id, v_meal_type_id, v_meal_type_name, v_is_used, v_is_active
    FROM coupons
    WHERE code = p_coupon_code;
    
    -- Coupon not found
    IF v_coupon_id IS NULL THEN
        RETURN QUERY SELECT false, 'Coupon not found'::TEXT, NULL::UUID, NULL::VARCHAR(50), NULL::VARCHAR(100);
        RETURN;
    END IF;
    
    -- Coupon not active
    IF NOT v_is_active THEN
        RETURN QUERY SELECT false, 'Coupon is not active'::TEXT, v_coupon_id, v_meal_type_id, v_meal_type_name;
        RETURN;
    END IF;
    
    -- Coupon already used
    IF v_is_used THEN
        RETURN QUERY SELECT false, 'Coupon has already been used'::TEXT, v_coupon_id, v_meal_type_id, v_meal_type_name;
        RETURN;
    END IF;
    
    -- Mark coupon as used
    UPDATE coupons 
    SET is_used = true, 
        used_at = CURRENT_TIMESTAMP,
        used_by_employee_id = p_employee_id,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = v_coupon_id;
    
    RETURN QUERY SELECT true, 'Coupon used successfully'::TEXT, v_coupon_id, v_meal_type_id, v_meal_type_name;
END;
$$ LANGUAGE plpgsql;

-- Function to generate meal usage report for a date range
CREATE OR REPLACE FUNCTION get_meal_usage_report(
    p_start_date DATE,
    p_end_date DATE
) RETURNS TABLE (
    meal_date DATE,
    meal_type_id VARCHAR(50),
    meal_name VARCHAR(100),
    total_meals BIGINT,
    total_revenue DECIMAL(10,2),
    unique_employees BIGINT,
    avg_price DECIMAL(10,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        DATE(recorded_at) as meal_date,
        mr.meal_type_id,
        mr.meal_name,
        COUNT(*) as total_meals,
        SUM(mr.price) as total_revenue,
        COUNT(DISTINCT mr.employee_id) as unique_employees,
        AVG(mr.price) as avg_price
    FROM meal_records mr
    WHERE DATE(recorded_at) BETWEEN p_start_date AND p_end_date
    GROUP BY DATE(recorded_at), mr.meal_type_id, mr.meal_name
    ORDER BY meal_date DESC, mr.meal_type_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get top consuming employees
CREATE OR REPLACE FUNCTION get_top_consuming_employees(
    p_limit INTEGER DEFAULT 10,
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL
) RETURNS TABLE (
    employee_id VARCHAR(50),
    employee_name VARCHAR(255),
    department VARCHAR(100),
    total_meals BIGINT,
    total_spent DECIMAL(10,2),
    avg_meal_cost DECIMAL(10,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.employee_id,
        e.name as employee_name,
        e.department,
        COUNT(mr.id) as total_meals,
        COALESCE(SUM(mr.price), 0) as total_spent,
        COALESCE(AVG(mr.price), 0) as avg_meal_cost
    FROM employees e
    LEFT JOIN meal_records mr ON e.employee_id = mr.employee_id
    WHERE (p_start_date IS NULL OR DATE(mr.recorded_at) >= p_start_date)
    AND (p_end_date IS NULL OR DATE(mr.recorded_at) <= p_end_date)
    GROUP BY e.employee_id, e.name, e.department
    HAVING COUNT(mr.id) > 0
    ORDER BY total_meals DESC, total_spent DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;
