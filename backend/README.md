# Lightweight Backend

A simple and lightweight Node.js/Express backend with authentication and product management.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy environment file:
```bash
# On macOS/Linux
cp .env.example .env

# On Windows
copy .env.example .env
```

3. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Health
- `GET /api/health` - Server health check

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (requires auth)

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (requires auth)

## Authentication

Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```
