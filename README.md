# Modern Shop - Lightweight E-commerce Application

A simple, lightweight full-stack e-commerce application with authentication, shopping cart, and admin product management.

## 🚀 Quick Start (After Cloning from GitHub)

### 1. Clone the Project
```bash
git clone https://github.com/AidoudiMohamedNidhal/projectMonRan.git
cd projectMonRan
```

### 2. Backend Setup
```bash
cd backend
npm install
```

### 3. Environment Setup
```bash
# On Windows
copy .env.example .env

# On macOS/Linux
cp .env.example .env
```

**Environment Variables Needed:**
- `PORT=3001` (Backend port)
- `JWT_SECRET=your-super-secret-jwt-key-change-it` (JWT secret)
- `JWT_EXPIRES_IN=7d` (Token expiration)
- `DB_PATH=./database.sqlite` (Database file path)

### 4. Start Backend
```bash
npm start
```
**Backend runs on:** `http://localhost:3001`

### 5. Frontend Setup
```bash
cd ../frontend
npm install
```

### 6. Start Frontend
```bash
npm start
```
**Frontend runs on:** `http://localhost:8081`

### 7. Access the Application
Open your browser and navigate to: `http://localhost:8081`

## 👤 Default Admin Account

**Email:** `admin@example.com`  
**Password:** `admin123`  
**Role:** `admin`

*The admin account is automatically created on first server startup.*

## 🛒 How to Use the Application

### For Normal Users (Customers):
1. **Register:** Create a new account with email and password
2. **Login:** Sign in with your credentials
3. **Browse Products:** View available products with prices and descriptions
4. **Add to Cart:** Click "Add to Cart" on any product
5. **Manage Cart:** Update quantities or remove items
6. **Checkout:** Place orders and view order history

### For Admin Users:
1. **Login:** Use the default admin account or create admin users
2. **Admin Dashboard:** Access the "Admin" page (only visible to admins)
3. **Manage Products:** Add, edit, or delete products
4. **View Orders:** Monitor customer orders

## 📁 Project Structure

```
projectMonRan/
├── backend/                 # Node.js/Express backend
│   ├── src/
│   │   └── index.js        # Main server file
│   ├── package.json         # Backend dependencies
│   ├── .env.example         # Environment variables template
│   └── README.md            # Backend documentation
├── frontend/                # HTML/CSS/JavaScript frontend
│   ├── index.html          # Main frontend page
│   ├── script.js           # Frontend JavaScript logic
│   ├── server.js           # Frontend server
│   ├── package.json        # Frontend dependencies
│   └── README.md           # Frontend documentation
└── README.md               # This file
```

## 🗄️ Database Setup

**No database setup required!** The application uses SQLite with the following features:
- **Auto-creation:** Database and tables are created automatically on first run
- **Sample data:** Sample products are inserted automatically
- **File-based:** Database stored as `database.sqlite` in backend directory

## 📋 Available Scripts

### Backend Scripts (`backend/package.json`)
```json
{
  "scripts": {
    "start": "node src/index.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  }
}
```

### Frontend Scripts (`frontend/package.json`)
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "node server.js"
  }
}
```

## 🔧 Ports Used

- **Backend:** `http://localhost:3001`
- **Frontend:** `http://localhost:8081`

## 🌟 Features

### Customer Features
- ✅ User registration and login
- ✅ Product browsing with categories
- ✅ Shopping cart management
- ✅ Order placement and history
- ✅ Responsive mobile design
- ✅ Modern UI with animations

### Admin Features
- ✅ Admin dashboard
- ✅ Product management (CRUD operations)
- ✅ Order monitoring
- ✅ Role-based access control
- ✅ Backend API protection

### Technical Features
- ✅ JWT authentication
- ✅ Role-based authorization
- ✅ SQLite database with auto-seeding
- ✅ RESTful API design
- ✅ Modern gradient UI
- ✅ Error handling and validation

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (requires auth)

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

### Cart
- `GET /api/cart` - Get user cart (requires auth)
- `POST /api/cart/add` - Add item to cart (requires auth)
- `PUT /api/cart/update` - Update cart quantity (requires auth)
- `DELETE /api/cart/remove/:productId` - Remove from cart (requires auth)

### Orders
- `POST /api/orders/checkout` - Place order (requires auth)
- `GET /api/orders` - Get user orders (requires auth)

### Health
- `GET /api/health` - Server health check

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **SQLite** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin requests

### Frontend
- **HTML5** - Structure
- **CSS3** - Styling with gradients and animations
- **Vanilla JavaScript** - Logic and API calls
- **Fetch API** - HTTP requests

## 🔒 Security Features

- ✅ Password hashing with bcryptjs
- ✅ JWT token authentication
- ✅ Role-based access control
- ✅ Admin route protection
- ✅ Input validation
- ✅ CORS configuration

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## 🚨 Important Notes

1. **Admin Account:** Default admin account is created automatically
2. **Database:** SQLite database is created automatically - no setup needed
3. **Ports:** Make sure ports 3001 and 8081 are available
4. **Environment:** Copy `.env.example` to `.env` before starting backend
5. **Dependencies:** Run `npm install` in both backend and frontend directories

## 🐛 Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Kill existing Node.js processes (Windows)
taskkill /F /IM node.exe
# Then restart servers
```

**Environment file missing:**
```bash
# In backend directory
copy .env.example .env  # Windows
cp .env.example .env    # macOS/Linux
```

**Dependencies not found:**
```bash
# Install in both directories
cd backend && npm install
cd ../frontend && npm install
```

## 📄 License

This project is open source and available under the MIT License.
