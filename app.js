// Sample product data with barcodes
const products = [
    { id: 1, name: 'Hamburger', price: 8.99, category: 'food', emoji: '🍔', barcode: '1001' },
    { id: 2, name: 'Cheeseburger', price: 9.99, category: 'food', emoji: '🍔', barcode: '1002' },
    { id: 3, name: 'Pizza Slice', price: 3.99, category: 'food', emoji: '🍕', barcode: '1003' },
    { id: 4, name: 'French Fries', price: 2.99, category: 'food', emoji: '🍟', barcode: '1004' },
    { id: 5, name: 'Chicken Wings', price: 7.99, category: 'food', emoji: '🍗', barcode: '1005' },
    { id: 6, name: 'Salad', price: 6.99, category: 'food', emoji: '🥗', barcode: '1006' },
    { id: 7, name: 'Soda', price: 1.99, category: 'drinks', emoji: '🥤', barcode: '2001' },
    { id: 8, name: 'Iced Tea', price: 1.99, category: 'drinks', emoji: '🍹', barcode: '2002' },
    { id: 9, name: 'Coffee', price: 2.49, category: 'drinks', emoji: '☕', barcode: '2003' },
    { id: 10, name: 'Milkshake', price: 4.99, category: 'drinks', emoji: '🥤', barcode: '2004' },
    { id: 11, name: 'Chips', price: 1.49, category: 'snacks', emoji: '🥔', barcode: '3001' },
    { id: 12, name: 'Cookies', price: 2.49, category: 'snacks', emoji: '🍪', barcode: '3002' },
    { id: 13, name: 'Ice Cream', price: 3.99, category: 'snacks', emoji: '🍦', barcode: '3003' },
    { id: 14, name: 'Donut', price: 1.99, category: 'snacks', emoji: '🍩', barcode: '3004' },
    { id: 15, name: 'Hot Dog', price: 3.99, category: 'food', emoji: '🌭', barcode: '1007' },
];

let cart = [];
let currentCategory = 'all';
let searchQuery = '';

let barcode = '';
let barcodeTimer;

const productsGrid = document.getElementById('products-grid');
const cartItems = document.getElementById('cart-items');
const subtotalEl = document.getElementById('subtotal');
const taxEl = document.getElementById('tax');
const totalEl = document.getElementById('total');
const checkoutBtn = document.getElementById('checkout-btn');
const clearCartBtn = document.getElementById('clear-cart');
const searchInput = document.getElementById('search');
const categoryBtns = document.querySelectorAll('.category-btn');
const currentDateEl = document.getElementById('current-date');
const currentTimeEl = document.getElementById('current-time');
const barcodeInput = document.getElementById('barcode-input');

let usbDevice = null;

function init() {
    renderProducts();
    updateCart();
    setupEventListeners();
    setupBarcodeScanner();
    updateDateTime();
    setupUsbScanner();
    setInterval(updateDateTime, 60000);
    
    barcodeInput.focus();
}

function setupEventListeners() {
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.dataset.category;
            renderProducts();
        });
    });

    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase();
        renderProducts();
    });

    clearCartBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear the cart?')) {
            cart = [];
            updateCart();
        }
    });

    checkoutBtn.addEventListener('click', processPayment);

    barcodeInput.addEventListener('keydown', handleBarcodeInput);
    
    document.addEventListener('click', () => {
        barcodeInput.focus();
    });
}

function setupBarcodeScanner() {
    let barcode = '';
    let lastKeyTime = 0;
    const barcodeInput = document.createElement('input');
    barcodeInput.type = 'text';
    barcodeInput.style.position = 'fixed';
    barcodeInput.style.opacity = 0;
    barcodeInput.style.pointerEvents = 'none';
    document.body.appendChild(barcodeInput);
    
    barcodeInput.focus();
    
    barcodeInput.addEventListener('keydown', (e) => {
        const currentTime = new Date().getTime();
        
        if (currentTime - lastKeyTime > 100) {
            barcode = '';
        }
        
        if (e.key.length === 1 && /[0-9a-zA-Z]/.test(e.key)) {
            barcode += e.key;
        }
        
        if (e.key === 'Enter' && barcode.length > 0) {
            e.preventDefault();
            processBarcode(barcode);
            barcode = '';
        }
        
        lastKeyTime = currentTime;
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'F8') { 
            e.preventDefault();
            barcodeInput.focus();
            showScannerActive(true);
        }
    });
}

function showScannerActive(isActive) {
    let scannerActive = document.getElementById('scanner-active');
    
    if (isActive) {
        if (!scannerActive) {
            scannerActive = document.createElement('div');
            scannerActive.id = 'scanner-active';
            scannerActive.textContent = 'Scanner Active - Press F8 to exit';
            scannerActive.style.position = 'fixed';
            scannerActive.style.top = '10px';
            scannerActive.style.right = '10px';
            scannerActive.style.background = '#27ae60';
            scannerActive.style.color = 'white';
            scannerActive.style.padding = '10px 15px';
            scannerActive.style.borderRadius = '4px';
            scannerActive.style.zIndex = '1000';
            scannerActive.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
            document.body.appendChild(scannerActive);
        }
        scannerActive.style.display = 'block';
        
        setTimeout(() => {
            if (scannerActive) {
                scannerActive.style.display = 'none';
            }
        }, 3000);
    } else if (scannerActive) {
        scannerActive.style.display = 'none';
    }
}

function processBarcode(barcode) {
    const product = products.find(p => p.barcode === barcode);
    
    if (product) {
        addToCart(product);
        
        const notification = document.createElement('div');
        notification.className = 'scanner-notification';
        notification.textContent = `Added: ${product.name}`;
        document.body.appendChild(notification);
        
        document.querySelector('.cart-section').scrollIntoView({ behavior: 'smooth' });
        
        setTimeout(() => {
            notification.remove();
        }, 1000);
    } else {
        const error = document.createElement('div');
        error.className = 'scanner-notification error';
        error.textContent = 'Product not found';
        document.body.appendChild(error);
        
        setTimeout(() => {
            error.remove();
        }, 2000);
    }
}

function renderProducts() {
    productsGrid.innerHTML = '';
    
    const filteredProducts = products.filter(product => {
        const matchesCategory = currentCategory === 'all' || product.category === currentCategory;
        const matchesSearch = product.name.toLowerCase().includes(searchQuery);
        return matchesCategory && matchesSearch;
    });

    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = '<p class="empty-cart">No products found</p>';
        return;
    }

    filteredProducts.forEach(product => {
        const productEl = document.createElement('div');
        productEl.className = 'product-card';
        productEl.innerHTML = `
            <div class="product-image">${product.emoji}</div>
            <div class="product-name">${product.name}</div>
            <div class="product-price">$${product.price.toFixed(2)}</div>
        `;
        productEl.addEventListener('click', () => addToCart(product));
        productsGrid.appendChild(productEl);
    });
}

function addToCart(product) {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    updateCart();
    
    const productCard = Array.from(productsGrid.children).find(card => {
        return card.querySelector('.product-name').textContent === product.name;
    });
    
    if (productCard) {
        productCard.style.transform = 'scale(0.95)';
        setTimeout(() => {
            productCard.style.transform = 'scale(1)';
        }, 200);
    }
}

function updateCart() {
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        checkoutBtn.disabled = true;
    } else {
        cartItems.innerHTML = '';
        checkoutBtn.disabled = false;
        
        cart.forEach((item, index) => {
            const itemEl = document.createElement('div');
            itemEl.className = 'cart-item';
            itemEl.innerHTML = `
                <div class="item-details">
                    <div class="item-name">${item.name}</div>
                    <div class="item-price">$${item.price.toFixed(2)} each</div>
                </div>
                <div class="item-quantity">
                    <button class="quantity-btn decrease" data-index="${index}">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn increase" data-index="${index}">+</button>
                </div>
                <div class="item-total">$${(item.price * item.quantity).toFixed(2)}</div>
            `;
            
            const decreaseBtn = itemEl.querySelector('.decrease');
            const increaseBtn = itemEl.querySelector('.increase');
            
            decreaseBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                updateQuantity(index, -1);
            });
            
            increaseBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                updateQuantity(index, 1);
            });
            
            cartItems.appendChild(itemEl);
        });
    }
    
    updateTotals();
}

function updateQuantity(index, change) {
    cart[index].quantity += change;
    
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    
    updateCart();
}

function updateTotals() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.08; 
    const total = subtotal + tax;
    
    subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    taxEl.textContent = `$${tax.toFixed(2)}`;
    totalEl.textContent = `$${total.toFixed(2)}`;
}

function setupBarcodeScanner() {
    let barcode = '';
    let readingBarcode = false;
    let barcodeTimer;
    document.addEventListener('keydown', (e) => {
        if ((e.key >= '0' && e.key <= '9') || e.key === 'Enter')
        if ((e.key >= '0' && e.key <= '9') || e.key === 'Enter') {
            if (!readingBarcode) {
                readingBarcode = true;
                barcode = '';
            }
            
            if (e.key !== 'Enter') {
                barcode += e.key;
            }
            
            clearTimeout(barcodeTimer);
            barcodeTimer = setTimeout(processBarcode, 100); 
        }
    });

    function processBarcode() {
        readingBarcode = false;
        
        if (barcode.length >= 3) {
            const product = products.find(p => p.barcode === barcode);
            
            if (product) {
                addToCart(product);
                showScanFeedback(product);
                
                if (window.innerWidth <= 1024) {
                    document.querySelector('.cart-section').scrollIntoView({ behavior: 'smooth' });
                }
            } else {
                showScanFeedback(null);
            }
        }
        
        barcode = '';
    }
}

function showScanFeedback(product) {
    const feedback = document.createElement('div');
    feedback.className = `scan-feedback ${product ? 'success' : 'error'}`;
    feedback.innerHTML = product 
        ? `✅ Added ${product.name} to cart!`
        : '❌ Product not found';
    
    document.body.appendChild(feedback);
    
    setTimeout(() => {
        feedback.classList.add('fade-out');
        setTimeout(() => feedback.remove(), 300);
    }, 2000);
}

function processPayment() {
    if (cart.length === 0) return;
    
    const total = parseFloat(totalEl.textContent.replace('$', ''));
    
    alert(`Processing payment of $${total.toFixed(2)}...\nThank you for your order!`);
    
    cart = [];
    updateCart();
    
    searchInput.value = '';
    searchQuery = '';
    currentCategory = 'all';
    document.querySelector('.category-btn.active').classList.remove('active');
    document.querySelector(`.category-btn[data-category="all"]`).classList.add('active');
    
    renderProducts();
}

function updateDateTime() {
    const now = new Date();
    
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    currentDateEl.textContent = now.toLocaleDateString('en-US', options);
    
    let hours = now.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; 
    const minutes = now.getMinutes().toString().padStart(2, '0');
    currentTimeEl.textContent = `${hours}:${minutes} ${ampm}`;
}

function handleBarcodeInput(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        
        const product = products.find(p => p.barcode === barcode);
        
        if (product) {
            addToCart(product);
            
            const productCard = Array.from(productsGrid.children).find(card => {
                return card.querySelector('.product-name').textContent === product.name;
            });
            
            if (productCard) {
                productCard.classList.add('scanned');
                setTimeout(() => {
                    productCard.classList.remove('scanned');
                }, 500);
            }
        } else {
            const feedback = document.createElement('div');
            feedback.className = 'barcode-feedback error';
            feedback.textContent = 'Product not found';
            document.body.appendChild(feedback);
            
            setTimeout(() => {
                feedback.remove();
            }, 2000);
        }
        
        barcode = '';
    } else if (e.key.length === 1) {
        barcode += e.key;
        
        if (barcodeTimer) {
            clearTimeout(barcodeTimer);
        }
        
        barcodeTimer = setTimeout(() => {
            barcode = '';
        }, 100);
    }
    
    e.target.value = '';
}

function setupUsbScanner() {
    // This function will handle USB barcode scanner input
    // USB barcode scanners typically act like keyboards and send keypress events
    // followed by an Enter key at the end of the scan
    
    let barcode = '';
    let lastKeyTime = Date.now();
    const barcodeInput = document.getElementById('barcode-input');
    
    // Only try to focus if there's a barcode input element and it's not already focused
    const tryFocusInput = () => {
        if (barcodeInput && document.activeElement !== barcodeInput) {
            try {
                barcodeInput.focus({ preventScroll: true });
            } catch (e) {
                console.log('Could not focus barcode input:', e);
            }
        }
    };
    
    // Try to focus the input when the page loads
    if (barcodeInput) {
        // Use setTimeout to avoid blocking the main thread
        setTimeout(tryFocusInput, 100);
        
        // Also try to focus when the window regains focus
        window.addEventListener('focus', tryFocusInput);
    }
    
    // Listen for keydown events on the document
    document.addEventListener('keydown', function(e) {
        const currentTime = Date.now();
        
        // If more than 100ms have passed since the last key, reset the barcode
        if (currentTime - lastKeyTime > 100) {
            barcode = '';
        }
        lastKeyTime = currentTime;
        
        // If it's the Enter key, process the barcode
        if (e.key === 'Enter' && barcode.length > 0) {
            e.preventDefault();
            processBarcode(barcode);
            barcode = '';
            // Try to refocus the input after processing
            if (barcodeInput) {
                setTimeout(tryFocusInput, 0);
            }
        } 
        // If it's a regular character, add it to the barcode
        else if (e.key.length === 1) {
            barcode += e.key;
        }
    });
}

document.addEventListener('DOMContentLoaded', init);
