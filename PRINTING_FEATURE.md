# Printing Feature Documentation

## Overview
The cafeteria system now includes automatic order number generation and receipt printing functionality. After an employee successfully scans their card and is allowed to use the cafeteria, the system generates a unique order number and provides options to print a receipt.

## Features

### 1. Order Number Generation
- **Format**: `ORD-YYYYMMDD-XXXX`
  - `ORD`: Fixed prefix
  - `YYYYMMDD`: Date in YYYY-MM-DD format
  - `XXXX`: Sequential number (last 4 digits of timestamp)
- **Example**: `ORD-20241215-1234`
- **Uniqueness**: Each order number is unique across the system

### 2. Receipt Printing
- **Two Formats Available**:
  - **Detailed**: Full receipt with all pricing information
  - **Simple**: Compact receipt with essential information
- **Print Options**:
  - **QZ Tray**: For thermal printers (recommended for POS systems)
  - **Browser Print**: Fallback option for regular printers

### 3. Receipt Content
The receipt includes:
- Order number
- Date and time
- Employee information (name, ID, department)
- Meal details (name, category)
- Pricing information (normal, supported, actual price)
- Support amount (if applicable)

## Technical Implementation

### Backend Changes
1. **MealRecord Entity**: Added `orderNumber` field with automatic generation
2. **PrintService**: New service for generating receipt text
3. **MealRecordController**: New endpoint `/meal-records/{id}/receipt`
4. **Database**: Added `order_number` column with unique constraint

### Frontend Changes
1. **CafeteriaScanner**: Updated to show order number and print button
2. **PrintService**: New service for handling print operations
3. **Types**: Updated to include `orderNumber` field

## Usage

### For Operators
1. Scan employee card or enter employee code
2. System validates employee and meal eligibility
3. Upon successful meal recording:
   - Order number is displayed prominently
   - Print button becomes available
   - Click "Print Receipt" to generate receipt

### For Administrators
- Order numbers are visible in meal records
- Receipts can be reprinted from the admin dashboard
- Order numbers help with tracking and reconciliation

## Printer Setup

### QZ Tray (Recommended for Thermal Printers)
1. Install QZ Tray from https://qz.io/download/
2. Configure your thermal printer
3. The system will automatically detect and use available printers

### Browser Print (Fallback)
- Works with any printer connected to the computer
- Opens a new window with formatted receipt
- Automatically triggers print dialog

## Database Migration
Run the following SQL script to add the order_number column:
```sql
-- Add order_number column to meal_records table
ALTER TABLE meal_records ADD COLUMN order_number VARCHAR(50) UNIQUE;

-- Create index for better performance
CREATE INDEX idx_meal_records_order_number ON meal_records(order_number);

-- Update existing records with order numbers (if any exist)
UPDATE meal_records 
SET order_number = CONCAT('ORD-', DATE_FORMAT(recorded_at, '%Y%m%d'), '-', LPAD(id % 10000, 4, '0'))
WHERE order_number IS NULL;
```

## API Endpoints

### Get Receipt Text
```
GET /meal-records/{id}/receipt?format={simple|detailed}
```

**Response:**
```json
{
  "receiptText": "MOE CAFETERIA\nOrder: ORD-20241215-1234\n...",
  "orderNumber": "ORD-20241215-1234",
  "timestamp": "2024-12-15T10:30:00",
  "format": "simple"
}
```

## Troubleshooting

### Print Issues
1. **QZ Tray not working**: Check if QZ Tray is installed and running
2. **Browser print not working**: Check popup blocker settings
3. **Thermal printer not detected**: Verify printer drivers and QZ Tray configuration

### Order Number Issues
1. **Duplicate order numbers**: Extremely rare due to timestamp-based generation
2. **Missing order numbers**: Check database migration script execution

## Future Enhancements
- Barcode/QR code generation for order numbers
- Email receipt functionality
- Receipt customization options
- Integration with external POS systems 