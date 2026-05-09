// Configuration
const API_BASE_URL = 'http://localhost:3001/api';

// State
let currentUser = null;
let authToken = null;
let cartItems = [];
let editingProductId = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    showPage('home');
});

// Check if user is logged in
function checkAuthStatus() {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('currentUser');
    
    if (token && user) {
        authToken = token;
        currentUser = JSON.parse(user);
        updateUIForLoggedInUser();
    }
}

// Update UI for logged in user
function updateUIForLoggedInUser() {
    document.getElementById('authBtn').classList.add('hidden');
    document.getElementById('profileBtn').classList.remove('hidden');
    document.getElementById('logoutBtn').classList.remove('hidden');
    document.getElementById('cartBtn').classList.remove('hidden');
    document.getElementById('ordersBtn').classList.remove('hidden');
    
    // Show admin button only for admin users
    if (currentUser.role === 'admin') {
        document.getElementById('adminBtn').classList.remove('hidden');
    }
    
    loadCartCount();
}

// Update UI for logged out user
function updateUIForLoggedOutUser() {
    document.getElementById('authBtn').classList.remove('hidden');
    document.getElementById('profileBtn').classList.add('hidden');
    document.getElementById('logoutBtn').classList.add('hidden');
    document.getElementById('cartBtn').classList.add('hidden');
    document.getElementById('ordersBtn').classList.add('hidden');
    document.getElementById('adminBtn').classList.add('hidden');
}

// Page navigation
function showPage(pageName) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.add('hidden');
    });
    
    // Show selected page
    document.getElementById(pageName + 'Page').classList.remove('hidden');
    
    // Update active nav button
    document.querySelectorAll('.nav-links button').forEach(btn => {
        btn.classList.remove('active');
    });
    const activeBtn = document.getElementById(pageName + 'Btn');
    if (activeBtn) activeBtn.classList.add('active');
    
    // Load page-specific data
    if (pageName === 'products') {
        loadProducts();
    } else if (pageName === 'cart') {
        loadCart();
    } else if (pageName === 'orders') {
        loadOrders();
    } else if (pageName === 'admin') {
        loadAdminProducts();
    } else if (pageName === 'profile' && currentUser) {
        loadProfile();
    }
}

// Toggle between login and register forms
function toggleAuthForm() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const authTitle = document.getElementById('authTitle');
    
    if (loginForm.classList.contains('hidden')) {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        authTitle.textContent = 'Login';
    } else {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        authTitle.textContent = 'Register';
    }
}

// Show message
function showMessage(message, type = 'success') {
    const container = document.getElementById('messageContainer');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    container.innerHTML = '';
    container.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

// API helper functions
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    };
    
    if (authToken) {
        config.headers.Authorization = `Bearer ${authToken}`;
    }
    
    try {
        const response = await fetch(url, config);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Request failed');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Authentication functions
async function login(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const data = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        
        authToken = data.token;
        currentUser = data.user;
        
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        updateUIForLoggedInUser();
        showMessage('Login successful!');
        showPage('home');
        
        // Clear form
        document.getElementById('loginPassword').value = '';
        
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

async function register(event) {
    event.preventDefault();
    
    const email = document.getElementById('registerEmail').value;
    const firstName = document.getElementById('registerFirstName').value;
    const lastName = document.getElementById('registerLastName').value;
    const password = document.getElementById('registerPassword').value;
    
    try {
        const data = await apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, firstName, lastName, password })
        });
        
        authToken = data.token;
        currentUser = data.user;
        
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        updateUIForLoggedInUser();
        showMessage('Registration successful!');
        showPage('home');
        
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

function logout() {
    authToken = null;
    currentUser = null;
    cartItems = [];
    
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    
    updateUIForLoggedOutUser();
    showMessage('Logged out successfully');
    showPage('home');
}

// Profile functions
async function loadProfile() {
    if (!currentUser) return;
    
    try {
        const data = await apiRequest('/auth/profile');
        const profileContent = document.getElementById('profileContent');
        
        profileContent.innerHTML = `
            <div class="user-info">
                <p><strong>ID:</strong> ${data.id}</p>
                <p><strong>Email:</strong> ${data.email}</p>
                <p><strong>Name:</strong> ${data.firstName || 'N/A'} ${data.lastName || ''}</p>
                <p><strong>Role:</strong> ${data.role}</p>
                <p><strong>Member since:</strong> ${new Date(data.createdAt).toLocaleDateString()}</p>
            </div>
        `;
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

// Product functions
async function loadProducts() {
    try {
        const products = await apiRequest('/products');
        const productsList = document.getElementById('productsList');
        
        if (products.length === 0) {
            productsList.innerHTML = '<p>No products found.</p>';
            return;
        }
        
        productsList.innerHTML = products.map(product => `
            <div class="product-card">
                <div class="category">${product.category || 'Uncategorized'}</div>
                <h3>${product.name}</h3>
                <p>${product.description || 'No description'}</p>
                <p class="price">$${product.price.toFixed(2)}</p>
                <button class="btn" onclick="addToCart(${product.id})">Add to Cart</button>
            </div>
        `).join('');
        
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

async function addProduct(event) {
    event.preventDefault();
    
    const name = document.getElementById('productName').value;
    const description = document.getElementById('productDescription').value;
    const price = parseFloat(document.getElementById('productPrice').value);
    const category = document.getElementById('productCategory').value;
    
    try {
        await apiRequest('/products', {
            method: 'POST',
            body: JSON.stringify({ name, description, price, category })
        });
        
        showMessage('Product added successfully!');
        
        // Clear form
        document.getElementById('productName').value = '';
        document.getElementById('productDescription').value = '';
        document.getElementById('productPrice').value = '';
        document.getElementById('productCategory').value = '';
        
        // Reload products
        loadProducts();
        
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

// Cart functions
async function loadCart() {
    try {
        const cart = await apiRequest('/cart');
        cartItems = cart;
        updateCartDisplay();
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

function updateCartDisplay() {
    const cartContent = document.getElementById('cartContent');
    
    if (cartItems.length === 0) {
        cartContent.innerHTML = '<p>Your cart is empty.</p>';
        return;
    }
    
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    cartContent.innerHTML = `
        <div class="cart-items">
            ${cartItems.map(item => `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <p>$${item.price.toFixed(2)} each</p>
                    </div>
                    <div class="cart-item-actions">
                        <div class="quantity-control">
                            <button class="btn btn-secondary" onclick="updateCartQuantity(${item.productId}, ${item.quantity - 1})">-</button>
                            <input type="number" value="${item.quantity}" min="1" readonly>
                            <button class="btn btn-secondary" onclick="updateCartQuantity(${item.productId}, ${item.quantity + 1})">+</button>
                        </div>
                        <button class="btn btn-danger" onclick="removeFromCart(${item.productId})">Remove</button>
                    </div>
                </div>
            `).join('')}
        </div>
        <div class="cart-total">
            Total: $${total.toFixed(2)}
        </div>
        <button class="btn btn-success" onclick="checkout()" style="width: 100%;">Checkout</button>
    `;
}

async function loadCartCount() {
    if (!authToken) return;
    
    try {
        const cart = await apiRequest('/cart');
        const count = cart.reduce((sum, item) => sum + item.quantity, 0);
        document.getElementById('cartCount').textContent = count;
    } catch (error) {
        console.error('Failed to load cart count:', error);
    }
}

async function addToCart(productId) {
    try {
        await apiRequest('/cart/add', {
            method: 'POST',
            body: JSON.stringify({ productId })
        });
        
        showMessage('Product added to cart!');
        loadCartCount();
        
        if (document.getElementById('cartPage').classList.contains('hidden') === false) {
            loadCart();
        }
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

async function updateCartQuantity(productId, quantity) {
    if (quantity < 1) return;
    
    try {
        await apiRequest('/cart/update', {
            method: 'PUT',
            body: JSON.stringify({ productId, quantity })
        });
        
        loadCart();
        loadCartCount();
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

async function removeFromCart(productId) {
    try {
        await apiRequest(`/cart/remove/${productId}`, {
            method: 'DELETE'
        });
        
        loadCart();
        loadCartCount();
        showMessage('Item removed from cart');
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

async function checkout() {
    try {
        const order = await apiRequest('/orders/checkout', {
            method: 'POST'
        });
        
        showMessage(`Order placed successfully! Order #${order.order.id}`);
        cartItems = [];
        loadCartCount();
        loadCart();
        
        setTimeout(() => showPage('orders'), 2000);
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

// Order functions
async function loadOrders() {
    try {
        const orders = await apiRequest('/orders');
        const ordersContent = document.getElementById('ordersContent');
        
        if (orders.length === 0) {
            ordersContent.innerHTML = '<p>No orders found.</p>';
            return;
        }
        
        ordersContent.innerHTML = orders.map(order => `
            <div class="user-info">
                <h4>Order #${order.id}</h4>
                <p><strong>Total:</strong> $${order.total.toFixed(2)}</p>
                <p><strong>Status:</strong> ${order.status}</p>
                <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
        `).join('');
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

// Admin functions
async function loadAdminProducts() {
    if (currentUser?.role !== 'admin') {
        showMessage('Admin access required', 'error');
        return;
    }
    
    try {
        const products = await apiRequest('/products');
        const adminProductsList = document.getElementById('adminProductsList');
        
        if (products.length === 0) {
            adminProductsList.innerHTML = '<p>No products found.</p>';
            return;
        }
        
        adminProductsList.innerHTML = products.map(product => `
            <div class="product-card">
                <div class="category">${product.category || 'Uncategorized'}</div>
                <h3>${product.name}</h3>
                <p>${product.description || 'No description'}</p>
                <p class="price">$${product.price.toFixed(2)}</p>
                <div class="product-actions">
                    <button class="btn btn-secondary" onclick="editProduct(${product.id})">Edit</button>
                    <button class="btn btn-danger" onclick="deleteProduct(${product.id})">Delete</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

async function adminAddProduct(event) {
    event.preventDefault();
    
    const name = document.getElementById('adminProductName').value;
    const description = document.getElementById('adminProductDescription').value;
    const price = parseFloat(document.getElementById('adminProductPrice').value);
    const category = document.getElementById('adminProductCategory').value;
    
    try {
        if (editingProductId) {
            // Update existing product
            await apiRequest(`/products/${editingProductId}`, {
                method: 'PUT',
                body: JSON.stringify({ name, description, price, category })
            });
            showMessage('Product updated successfully!');
            cancelEdit();
        } else {
            // Create new product
            await apiRequest('/products', {
                method: 'POST',
                body: JSON.stringify({ name, description, price, category })
            });
            showMessage('Product added successfully!');
        }
        
        // Clear form
        document.getElementById('adminProductName').value = '';
        document.getElementById('adminProductDescription').value = '';
        document.getElementById('adminProductPrice').value = '';
        document.getElementById('adminProductCategory').value = '';
        
        // Reload products
        loadAdminProducts();
        
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

async function editProduct(productId) {
    try {
        const products = await apiRequest('/products');
        const product = products.find(p => p.id === productId);
        
        if (!product) {
            showMessage('Product not found', 'error');
            return;
        }
        
        // Fill form with product data
        document.getElementById('adminProductName').value = product.name;
        document.getElementById('adminProductDescription').value = product.description || '';
        document.getElementById('adminProductPrice').value = product.price;
        document.getElementById('adminProductCategory').value = product.category || '';
        
        // Update form for editing
        editingProductId = productId;
        document.getElementById('formTitle').textContent = 'Edit Product';
        document.getElementById('submitBtn').textContent = 'Update Product';
        document.getElementById('cancelBtn').classList.remove('hidden');
        
        // Scroll to form
        document.getElementById('adminProductForm').scrollIntoView({ behavior: 'smooth' });
        
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

function cancelEdit() {
    editingProductId = null;
    document.getElementById('formTitle').textContent = 'Add New Product';
    document.getElementById('submitBtn').textContent = 'Add Product';
    document.getElementById('cancelBtn').classList.add('hidden');
    
    // Clear form
    document.getElementById('adminProductName').value = '';
    document.getElementById('adminProductDescription').value = '';
    document.getElementById('adminProductPrice').value = '';
    document.getElementById('adminProductCategory').value = '';
}

async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) {
        return;
    }
    
    try {
        await apiRequest(`/products/${productId}`, {
            method: 'DELETE'
        });
        
        showMessage('Product deleted successfully!');
        loadAdminProducts();
    } catch (error) {
        showMessage(error.message, 'error');
    }
}
