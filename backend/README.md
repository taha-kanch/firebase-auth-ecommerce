# Product Management API

A RESTful API for managing products with Google Authentication, built with Node.js, Express, and PostgreSQL.

## Features

- Product Management (CRUD operations)
- Google Authentication using Firebase
- Pagination, Sorting, and Filtering
- Inventory Management
- Audit Logging
- Input Validation
- Error Handling
- Security Best Practices

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- Firebase Project with Authentication enabled

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd sofuled-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=product_management
DB_USER=postgres
DB_PASSWORD=your_password

FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email
```

4. Set up the database:
```bash
psql -U postgres -d product_management -f src/db/schema.sql
```

## Running the Application

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

### Authentication
All endpoints except GET requests require a valid Firebase authentication token in the Authorization header:
```
Authorization: Bearer <firebase-token>
```

### Products

#### Create Product
```
POST /api/products
```
Request body:
```json
{
  "name": "Product Name",
  "description": "Product Description",
  "price": 99.99,
  "inventory": 100,
  "image_url": "https://example.com/image.jpg"
}
```

#### Get All Products
```
GET /api/products?page=1&limit=10&sort=name&order=asc&search=keyword
```

#### Get Product by ID
```
GET /api/products/:id
```

#### Update Product
```
PUT /api/products/:id
```
Request body (all fields optional):
```json
{
  "name": "Updated Name",
  "description": "Updated Description",
  "price": 149.99,
  "inventory": 50,
  "image_url": "https://example.com/new-image.jpg"
}
```

#### Delete Product
```
DELETE /api/products/:id
```

#### Sell Product
```
POST /api/products/:id/sell
```
Request body:
```json
{
  "quantity": 5
}
```

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Internal Server Error

## Logging

The application uses Winston for logging. Logs are written to:
- Console
- `error.log` for error messages
- `combined.log` for all messages

## Security Features

- Helmet.js for security headers
- CORS enabled
- Input validation using express-validator
- SQL injection prevention using parameterized queries
- Authentication middleware
- Audit logging for all product changes

## Database Schema

The application uses two main tables:

1. `products`:
   - id (SERIAL PRIMARY KEY)
   - name (VARCHAR, UNIQUE)
   - description (TEXT)
   - price (DECIMAL)
   - inventory (INTEGER)
   - image_url (VARCHAR)
   - created_at (TIMESTAMP)
   - updated_at (TIMESTAMP)

2. `product_audit_logs`:
   - id (SERIAL PRIMARY KEY)
   - product_id (INTEGER, FOREIGN KEY)
   - user_id (VARCHAR)
   - action (VARCHAR)
   - details (JSONB)
   - created_at (TIMESTAMP)

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request 