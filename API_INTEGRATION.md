# MOE Cafeteria Frontend API Integration

## Overview

The frontend has been updated to consume the backend API instead of using localStorage. All data operations now communicate with the Spring Boot backend running on `http://localhost:8080/api`.

## Configuration

### Environment Variables

Create a `.env.local` file in the frontend root directory with the following configuration:

```env
# Backend API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8080/api

# API Authentication (for development)
NEXT_PUBLIC_API_USERNAME=admin
NEXT_PUBLIC_API_PASSWORD=admin123

# Frontend Configuration
NEXT_PUBLIC_APP_NAME=MOE Cafeteria Management
NEXT_PUBLIC_APP_VERSION=1.0.0
```

## Updated Services

### 1. Axios Instance (`lib/axiosInstance.ts`)

- **Base URL**: `http://localhost:8080/api`
- **Authentication**: Basic Auth with admin credentials
- **Error Handling**: Comprehensive error handling with proper logging
- **Timeout**: 10 seconds

### 2. Meal Service (`lib/meal-service.ts`)

**API Endpoints:**
- `GET /meal-types` - Get all meal types
- `GET /meal-types/enabled` - Get enabled meal types
- `GET /meal-types/{id}` - Get meal type by ID
- `POST /meal-types` - Create new meal type
- `PUT /meal-types/{id}` - Update meal type
- `DELETE /meal-types/{id}` - Delete meal type
- `PATCH /meal-types/{id}/toggle` - Toggle meal type status

- `GET /meal-categories` - Get all meal categories
- `GET /meal-categories/enabled` - Get enabled meal categories
- `GET /meal-categories/by-type/{mealTypeId}` - Get categories by meal type
- `GET /meal-categories/{id}` - Get meal category by ID
- `POST /meal-categories` - Create new meal category
- `PUT /meal-categories/{id}` - Update meal category
- `DELETE /meal-categories/{id}` - Delete meal category
- `PATCH /meal-categories/{id}/toggle` - Toggle meal category status

### 3. Employee Service (`lib/employee-service.ts`)

**API Endpoints:**
- `GET /employees` - Get all employees
- `GET /employees/support-eligible` - Get support eligible employees
- `GET /employees/{id}` - Get employee by ID
- `GET /employees/by-card/{cardId}` - Get employee by card ID
- `GET /employees/by-code/{code}` - Get employee by short code
- `POST /employees` - Create new employee
- `PUT /employees/{id}` - Update employee
- `DELETE /employees/{id}` - Delete employee
- `PATCH /employees/{id}/toggle` - Toggle employee status
- `POST /employees/{id}/assign-card` - Assign card to employee

- `GET /employees/{id}/usage-stats` - Get employee usage statistics
- `GET /employees/{id}/meal-records` - Get employee meal records

### 4. Meal Records Service

**API Endpoints:**
- `GET /meal-records` - Get all meal records
- `GET /meal-records/by-date-range` - Get records by date range
- `GET /meal-records/by-department` - Get records by department
- `POST /meal-records/record` - Record a meal
- `GET /meal-records/check-duplicate` - Check for duplicate meals

### 5. Support Configuration Service

**API Endpoints:**
- `GET /support-config` - Get support configuration
- `PUT /support-config` - Update support configuration

### 6. Coupon Service (`lib/coupon-service.ts`)

**API Endpoints:**
- `GET /coupon-batches` - Get all coupon batches
- `GET /coupon-batches/{id}` - Get coupon batch by ID
- `POST /coupon-batches` - Create new coupon batch
- `PUT /coupon-batches/{id}` - Update coupon batch
- `DELETE /coupon-batches/{id}` - Delete coupon batch
- `POST /coupon-batches/{id}/generate-coupons` - Generate coupons for batch

- `GET /coupons` - Get all coupons
- `GET /coupons/by-batch/{batchId}` - Get coupons by batch
- `GET /coupons/by-code/{code}` - Get coupon by code
- `POST /coupons/{code}/redeem` - Redeem coupon
- `GET /coupons/stats` - Get coupon statistics

## Authentication

The frontend uses Basic Authentication with the following default credentials:
- **Username**: `admin`
- **Password**: `admin123`

These credentials are automatically included in all API requests via the axios interceptor.

## Error Handling

All API calls include comprehensive error handling:

1. **Network Errors**: Connection issues, timeouts
2. **HTTP Errors**: 401, 403, 404, 500, etc.
3. **Business Logic Errors**: Validation errors, business rule violations

Error messages are logged to the console and thrown as user-friendly error messages.

## Data Flow

1. **Frontend Components** → **Service Functions** → **API Client** → **Backend API**
2. **Backend API** → **Database** → **Response** → **Frontend Components**

## Migration from localStorage

The following changes were made to migrate from localStorage to API:

1. **Removed**: All localStorage operations
2. **Removed**: Mock data and demo data
3. **Removed**: Artificial delays (setTimeout)
4. **Added**: API client with authentication
5. **Added**: Proper error handling
6. **Added**: Real-time data synchronization

## Development Setup

1. **Start Backend**: Ensure the Spring Boot backend is running on port 8080
2. **Configure Environment**: Create `.env.local` with API configuration
3. **Start Frontend**: Run `npm run dev` or `pnpm dev`
4. **Test Integration**: Verify API calls are working in browser dev tools

## Production Considerations

1. **Security**: Use proper authentication (JWT, OAuth) instead of Basic Auth
2. **Environment**: Configure different API URLs for staging/production
3. **Error Handling**: Implement proper error boundaries and user notifications
4. **Caching**: Consider implementing client-side caching for better performance
5. **Monitoring**: Add API call monitoring and analytics 