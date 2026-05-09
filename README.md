# Lightweight App

A simple, lightweight full-stack application with authentication and product management.

## Project Structure

```
lightweight-app/
├── backend/          # Node.js/Express backend
│   ├── src/
│   │   └── index.js  # Main server file
│   ├── package.json
│   └── README.md
├── frontend/         # HTML/CSS/JavaScript frontend
│   ├── index.html
│   ├── script.js
│   └── README.md
└── README.md         # This file
```

## Quick Start

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment:
```bash
# On macOS/Linux
cp .env.example .env

# On Windows
copy .env.example .env
```

4. Start the server:
```bash
npm run dev
```

The backend will run on `http://localhost:3001`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Start the frontend:
```bash
npm run dev
```

The frontend will run on `http://localhost:8081`

## Features

- **Authentication**: User registration and login with JWT
- **Product Management**: Browse and add products
- **User Profiles**: View user information
- **Simple Design**: Clean, responsive interface
- **Lightweight**: Minimal dependencies and fast performance

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (requires auth)

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (requires auth)

### Health
- `GET /api/health` - Server health check

## Technology Stack

### Backend
- Node.js
- Express.js
- SQLite (database)
- JWT (authentication)
- bcryptjs (password hashing)

### Frontend
- HTML5
- CSS3
- Vanilla JavaScript
- Fetch API

## Development

The project is designed to be simple and easy to understand. No complex build tools or frameworks are required.
