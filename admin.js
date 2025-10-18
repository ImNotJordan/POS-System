// DOM Elements
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const addProductBtn = document.getElementById('add-product-btn');
const productForm = document.getElementById('product-form');
const productModal = document.getElementById('product-modal');
const closeModalBtn = document.querySelector('.close-btn');
const cancelProductBtn = document.getElementById('cancel-product');
const productsTableBody = document.getElementById('products-table-body');
const inventoryTableBody = document.getElementById('inventory-table-body');
const generateReportBtn = document.getElementById('generate-report');
const startDateInput = document.getElementById('start-date');
const endDateInput = document.getElementById('end-date');
const totalSalesEl = document.getElementById('total-sales');
const totalOrdersEl = document.getElementById('total-orders');
const avgOrderEl = document.getElementById('avg-order');
const salesChartCtx = document.getElementById('sales-chart').getContext('2d');

// Sample data - In a real app, this would come from a backend
let salesData = [];
let products = JSON.parse(localStorage.getItem('products')) || [
    { id: 1, name: 'Hamburger', price: 8.99, category: 'food', emoji: '🍔', barcode: '1001', stock: 50 },
    { id: 2, name: 'Cheeseburger', price: 9.99, category: 'food', emoji: '🍔', barcode: '1002', stock: 45 },
    { id: 3, name: 'Pizza Slice', price: 3.99, category: 'food', emoji: '🍕', barcode: '1003', stock: 60 },
    { id: 4, name: 'French Fries', price: 2.99, category: 'food', emoji: '🍟', barcode: '1004', stock: 70 },
    { id: 5, name: 'Chicken Wings', price: 7.99, category: 'food', emoji: '🍗', barcode: '1005', stock: 40 },
    { id: 6, name: 'Salad', price: 6.99, category: 'food', emoji: '🥗', barcode: '1006', stock: 30 },
    { id: 7, name: 'Soda', price: 1.99, category: 'drinks', emoji: '🥤', barcode: '2001', stock: 100 },
    { id: 8, name: 'Iced Tea', price: 1.99, category: 'drinks', emoji: '🍹', barcode: '2002', stock: 80 },
    { id: 9, name: 'Coffee', price: 2.49, category: 'drinks', emoji: '☕', barcode: '2003', stock: 90 },
    { id: 10, name: 'Milkshake', price: 4.99, category: 'drinks', emoji: '🥤', barcode: '2004', stock: 50 },
    { id: 11, name: 'Chips', price: 1.49, category: 'snacks', emoji: '🥔', barcode: '3001', stock: 120 },
    { id: 12, name: 'Cookies', price: 2.49, category: 'snacks', emoji: '🍪', barcode: '3002', stock: 85 },
    { id: 13, name: 'Ice Cream', price: 3.99, category: 'snacks', emoji: '🍦', barcode: '3003', stock: 60 },
    { id: 14, name: 'Donut', price: 1.99, category: 'snacks', emoji: '🍩', barcode: '3004', stock: 75 },
    { id: 15, name: 'Hot Dog', price: 3.99, category: 'food', emoji: '🌭', barcode: '1007', stock: 55 }
];

// Initialize the admin dashboard
document.addEventListener('DOMContentLoaded', () => {
    // Set default dates for the sales report
    const today = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(today.getMonth() - 1);
    
    startDateInput.valueAsDate = oneMonthAgo;
    endDateInput.valueAsDate = today;
    
    // Load data
    loadProducts();
    loadInventory();
    generateSalesReport();
    
    // Set up event listeners
    setupEventListeners();
});

// Set up event listeners
function setupEventListeners() {
    // Tab switching
    tabButtons.forEach(button => {
        button.addEventListener('click', () => switchTab(button.dataset.tab));
    });
    
    // Product modal
    addProductBtn.addEventListener('click', () => openProductModal());
    closeModalBtn.addEventListener('click', closeModal);
    cancelProductBtn.addEventListener('click', closeModal);
    productForm.addEventListener('submit', handleProductSubmit);
    
    // Sales report
    generateReportBtn.addEventListener('click', generateSalesReport);
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === productModal) {
            closeModal();
        }
    });
}

// Switch between tabs
function switchTab(tabId) {
    // Update active tab button
    tabButtons.forEach(button => {
        if (button.dataset.tab === tabId) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
    
    // Show active tab content
    tabContents.forEach(content => {
        if (content.id === `${tabId}-tab`) {
            content.classList.add('active');
        } else {
            content.classList.remove('active');
        }
    });
}

// Product Management
function loadProducts() {
    productsTableBody.innerHTML = '';
    
    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.id}</td>
            <td>${product.emoji || ''} ${product.name}</td>
            <td>$${product.price.toFixed(2)}</td>
            <td>${product.category}</td>
            <td>${product.barcode}</td>
            <td class="actions">
                <button class="btn secondary edit-product" data-id="${product.id}">Edit</button>
                <button class="btn danger delete-product" data-id="${product.id}">Delete</button>
            </td>
        `;
        productsTableBody.appendChild(row);
    });
    
    // Add event listeners to edit/delete buttons
    document.querySelectorAll('.edit-product').forEach(btn => {
        btn.addEventListener('click', (e) => editProduct(e.target.dataset.id));
    });
    
    document.querySelectorAll('.delete-product').forEach(btn => {
        btn.addEventListener('click', (e) => deleteProduct(e.target.dataset.id));
    });
}

function openProductModal(product = null) {
    const modalTitle = document.getElementById('modal-title');
    const productIdInput = document.getElementById('product-id');
    const productNameInput = document.getElementById('product-name');
    const productPriceInput = document.getElementById('product-price');
    const productCategorySelect = document.getElementById('product-category');
    const productBarcodeInput = document.getElementById('product-barcode');
    const productEmojiInput = document.getElementById('product-emoji');
    
    if (product) {
        // Edit mode
        modalTitle.textContent = 'Edit Product';
        productIdInput.value = product.id;
        productNameInput.value = product.name;
        productPriceInput.value = product.price;
        productCategorySelect.value = product.category;
        productBarcodeInput.value = product.barcode;
        productEmojiInput.value = product.emoji || '';
    } else {
        // Add mode
        modalTitle.textContent = 'Add New Product';
        productForm.reset();
        productIdInput.value = '';
    }
    
    productModal.classList.add('active');
}

function closeModal() {
    productModal.classList.remove('active');
    productForm.reset();
}

function handleProductSubmit(e) {
    e.preventDefault();
    
    const productId = document.getElementById('product-id').value;
    const productData = {
        name: document.getElementById('product-name').value,
        price: parseFloat(document.getElementById('product-price').value),
        category: document.getElementById('product-category').value,
        barcode: document.getElementById('product-barcode').value,
        emoji: document.getElementById('product-emoji').value || null,
        stock: 0 // Default stock for new products
    };
    
    if (productId) {
        // Update existing product
        const index = products.findIndex(p => p.id === parseInt(productId));
        if (index !== -1) {
            // Preserve the stock when updating
            productData.stock = products[index].stock;
            products[index] = { ...products[index], ...productData };
        }
    } else {
        // Add new product
        const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
        products.push({ id: newId, ...productData });
    }
    
    // Save to localStorage
    localStorage.setItem('products', JSON.stringify(products));
    
    // Update UI
    loadProducts();
    loadInventory();
    closeModal();
}

function editProduct(id) {
    const product = products.find(p => p.id === parseInt(id));
    if (product) {
        openProductModal(product);
    }
}

function deleteProduct(id) {
    if (confirm('Are you sure you want to delete this product?')) {
        products = products.filter(p => p.id !== parseInt(id));
        localStorage.setItem('products', JSON.stringify(products));
        loadProducts();
        loadInventory();
    }
}

// Inventory Management
function loadInventory() {
    inventoryTableBody.innerHTML = '';
    
    const categoryFilter = document.getElementById('inventory-category').value;
    const searchQuery = document.getElementById('inventory-search').value.toLowerCase();
    
    const filteredProducts = products.filter(product => {
        const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
        const matchesSearch = product.name.toLowerCase().includes(searchQuery) || 
                            product.barcode.includes(searchQuery);
        return matchesCategory && matchesSearch;
    });
    
    filteredProducts.forEach(product => {
        const row = document.createElement('tr');
        const stockStatus = product.stock > 10 ? 'In Stock' : product.stock > 0 ? 'Low Stock' : 'Out of Stock';
        const statusClass = product.stock > 10 ? 'in-stock' : product.stock > 0 ? 'low-stock' : 'out-of-stock';
        
        row.innerHTML = `
            <td>${product.emoji || ''} ${product.name}</td>
            <td>${product.category}</td>
            <td>${product.stock}</td>
            <td><span class="status-badge ${statusClass}">${stockStatus}</span></td>
            <td class="actions">
                <input type="number" min="0" value="${product.stock}" class="stock-input" data-id="${product.id}">
                <button class="btn primary update-stock" data-id="${product.id}">Update</button>
            </td>
        `;
        inventoryTableBody.appendChild(row);
    });
    
    // Add event listeners to update stock buttons
    document.querySelectorAll('.update-stock').forEach(btn => {
        btn.addEventListener('click', (e) => updateStock(e.target.dataset.id));
    });
}

function updateStock(productId) {
    const input = document.querySelector(`.stock-input[data-id="${productId}"]`);
    const newStock = parseInt(input.value) || 0;
    
    const product = products.find(p => p.id === parseInt(productId));
    if (product) {
        product.stock = newStock;
        localStorage.setItem('products', JSON.stringify(products));
        loadInventory();
    }
}

// Sales Reporting
function generateSalesReport() {
    // In a real app, this would fetch data from a backend
    // For now, we'll generate some sample data
    const startDate = new Date(startDateInput.value);
    const endDate = new Date(endDateInput.value);
    
    // Generate sample sales data for the date range
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const salesByDay = [];
    let totalSales = 0;
    let totalOrders = 0;
    
    for (let i = 0; i <= days; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        
        // Random number of orders per day (1-10)
        const orders = Math.floor(Math.random() * 10) + 1;
        let dailySales = 0;
        
        for (let j = 0; j < orders; j++) {
            // Random order total between $5 and $50
            const orderTotal = 5 + Math.random() * 45;
            dailySales += orderTotal;
            totalOrders++;
        }
        
        totalSales += dailySales;
        
        salesByDay.push({
            date: date.toISOString().split('T')[0],
            sales: parseFloat(dailySales.toFixed(2)),
            orders: orders
        });
    }
    
    // Update the UI
    updateSalesSummary(totalSales, totalOrders);
    renderSalesChart(salesByDay);
}

function updateSalesSummary(totalSales, totalOrders) {
    totalSalesEl.textContent = `$${totalSales.toFixed(2)}`;
    totalOrdersEl.textContent = totalOrders;
    const avgOrder = totalOrders > 0 ? totalSales / totalOrders : 0;
    avgOrderEl.textContent = `$${avgOrder.toFixed(2)}`;
}

function renderSalesChart(salesData) {
    // Destroy previous chart if it exists
    if (window.salesChart) {
        window.salesChart.destroy();
    }
    
    const labels = salesData.map(item => {
        const date = new Date(item.date);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    
    const sales = salesData.map(item => item.sales);
    
    window.salesChart = new Chart(salesChartCtx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Daily Sales ($)',
                data: sales,
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                borderWidth: 2,
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        callback: function(value) {
                            return '$' + value;
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `$${context.parsed.y.toFixed(2)}`;
                        }
                    }
                }
            }
        }
    });
}

// Initialize the dashboard
init();
