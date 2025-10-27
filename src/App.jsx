import { useState, useEffect } from 'react'
import './App.css'
import { db, auth } from './firebase'
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'

function App() {
  const [activeTab, setActiveTab] = useState('pos')
  const [cart, setCart] = useState([])
  const [customers, setCustomers] = useState([])
  const [orders, setOrders] = useState([])
  const [inventory, setInventory] = useState([])
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [orderFilter, setOrderFilter] = useState('all')
  const [showAddProductModal, setShowAddProductModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [notification, setNotification] = useState(null)
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)) // Format: YYYY-MM
  const [userRole, setUserRole] = useState(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [confirmCallback, setConfirmCallback] = useState(null)
  const [confirmMessage, setConfirmMessage] = useState({ title: '', message: '' })
  const [barcodeBuffer, setBarcodeBuffer] = useState('')
  const [barcodeDetected, setBarcodeDetected] = useState(false)
  const [currentBarcode, setCurrentBarcode] = useState('')

  // Show notification
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  // Show confirmation dialog
  const showConfirmation = (callback, title = 'Confirm Action', message = 'Are you sure you want to proceed?') => {
    setConfirmCallback(() => callback)
    setConfirmMessage({ title, message })
    setShowConfirmDialog(true)
  }

  // Handle confirmation
  const handleConfirm = () => {
    if (confirmCallback) {
      confirmCallback()
    }
    setShowConfirmDialog(false)
    setConfirmCallback(null)
    setConfirmMessage({ title: '', message: '' })
  }

  // Handle cancel
  const handleCancel = () => {
    setShowConfirmDialog(false)
    setConfirmCallback(null)
    setConfirmMessage({ title: '', message: '' })
  }

  // Fetch user role from Firestore
  const fetchUserRole = async (userId) => {
    try {
      const userDoc = await getDocs(collection(db, 'users'))
      let role = 'user' // Default role
      userDoc.forEach((doc) => {
        if (doc.id === userId) {
          role = doc.data().role || 'user'
        }
      })
      setUserRole(role)
      return role
    } catch (error) {
      setUserRole('user') // Default to user on error
    }
  }

  // Check authentication status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)
      if (currentUser) {
        await fetchUserRole(currentUser.uid)
      } else {
        setUserRole(null)
      }
      setIsLoading(false)
    })
    return () => unsubscribe()
  }, [])

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault()
    setLoginError('')
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword)
      showNotification('Login successful!', 'success')
    } catch (error) {
      if (error.code === 'auth/invalid-credential') {
        setLoginError('Invalid email or password')
      } else if (error.code === 'auth/user-not-found') {
        setLoginError('No account found with this email')
      } else if (error.code === 'auth/wrong-password') {
        setLoginError('Incorrect password')
      } else {
        setLoginError('Login failed. Please try again.')
      }
    }
  }

  // Handle logout
  const handleLogout = () => {
    showConfirmation(
      async () => {
        try {
          await signOut(auth)
          showNotification('Logged out successfully', 'info')
        } catch (error) {
          showNotification('Error logging out', 'error')
        }
      },
      'Confirm Logout',
      'Are you sure you want to logout?'
    )
  }

  // Download reports data as Excel
  const downloadReports = () => {
    try {
      // Calculate summary statistics
      const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0)
      const totalOrders = orders.length
      const pendingOrders = orders.filter(o => o.status === 'pending').length
      const completedOrders = orders.filter(o => o.status === 'completed').length

      // Create HTML table for Excel
      let htmlContent = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta charset="utf-8">
          <style>
            table { border-collapse: collapse; width: 100%; }
            th { background-color: #667eea; color: white; padding: 12px; text-align: left; font-weight: bold; }
            td { padding: 10px; border: 1px solid #ddd; }
            .header-section { font-size: 18px; font-weight: bold; margin: 20px 0; color: #667eea; }
            .summary-table { margin-bottom: 30px; }
            .summary-table td:first-child { font-weight: bold; background-color: #f7fafc; }
            .title { font-size: 24px; font-weight: bold; color: #2d3748; margin-bottom: 10px; }
            .date { color: #718096; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="title">🧵 EMBROIDERY POS SYSTEM - SALES REPORT</div>
          <div class="date">Generated: ${new Date().toLocaleString()}</div>
          
          <div class="header-section">📊 SUMMARY STATISTICS</div>
          <table class="summary-table">
            <tr><td>Total Revenue</td><td>$${totalRevenue.toFixed(2)}</td></tr>
            <tr><td>Total Orders</td><td>${totalOrders}</td></tr>
            <tr><td>Pending Orders</td><td>${pendingOrders}</td></tr>
            <tr><td>Completed Orders</td><td>${completedOrders}</td></tr>
            <tr><td>Inventory Items</td><td>${inventory.length}</td></tr>
          </table>
          
          <div class="header-section">📋 ORDER DETAILS</div>
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Total</th>
                <th>Items</th>
              </tr>
            </thead>
            <tbody>
      `

      // Add order rows
      orders.forEach(order => {
        const itemsList = order.items.map(item => `${item.name} (Qty: ${item.qty})`).join(', ')
        htmlContent += `
          <tr>
            <td>${order.id}</td>
            <td>${order.customer}</td>
            <td>${order.date}</td>
            <td>${order.dueDate}</td>
            <td>${order.status}</td>
            <td>$${order.total.toFixed(2)}</td>
            <td>${itemsList}</td>
          </tr>
        `
      })

      htmlContent += `
            </tbody>
          </table>
        </body>
        </html>
      `

      // Create blob and download as Excel file
      const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      
      link.setAttribute('href', url)
      link.setAttribute('download', `sales_report_${new Date().toISOString().slice(0, 10)}.xls`)
      link.style.visibility = 'hidden'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      showNotification('Excel report downloaded successfully!', 'success')
    } catch (error) {
      showNotification('Error downloading report: ' + error.message, 'error')
    }
  }

  // Load inventory from Firebase on mount
  useEffect(() => {
    loadInventoryFromFirebase()
  }, [])

  // Barcode Scanner Detection
  useEffect(() => {
    let barcodeTimeout
    
    const handleKeyPress = (e) => {
      // Only process on POS tab
      if (activeTab !== 'pos') return
      
      // Ignore if user is typing in an input field
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      
      // Clear previous timeout
      clearTimeout(barcodeTimeout)
      
      // Handle Enter key (end of barcode scan)
      if (e.key === 'Enter') {
        if (barcodeBuffer.length > 0) {
          processBarcode(barcodeBuffer)
          setBarcodeBuffer('')
        }
        return
      }
      
      // Build barcode buffer with alphanumeric characters
      if (e.key.length === 1) {
        const newBuffer = barcodeBuffer + e.key
        setBarcodeBuffer(newBuffer)
        
        // Auto-process after 100ms of no input (typical scanner behavior)
        barcodeTimeout = setTimeout(() => {
          if (newBuffer.length > 3) { // Minimum barcode length
            processBarcode(newBuffer)
          }
          setBarcodeBuffer('')
        }, 100)
      }
    }
    
    // Add event listener
    window.addEventListener('keypress', handleKeyPress)
    
    // Cleanup
    return () => {
      window.removeEventListener('keypress', handleKeyPress)
      clearTimeout(barcodeTimeout)
    }
  }, [activeTab, barcodeBuffer, inventory, cart])

  // Process scanned barcode
  const processBarcode = (barcode) => {
    // Show scanning feedback
    setBarcodeDetected(true)
    setTimeout(() => setBarcodeDetected(false), 1000)
    
    // Search for product by ID or name
    const product = inventory.find(item => 
      item.id === barcode || 
      item.id.toString() === barcode ||
      item.name.toLowerCase().includes(barcode.toLowerCase())
    )
    
    if (product) {
      addToCart(product)
      showNotification(`🔍 Scanned: ${product.name} added to cart!`, 'success')
    } else {
      showNotification(`⚠️ Product not found: ${barcode}`, 'error')
    }
  }

  // Load inventory from Firebase
  const loadInventoryFromFirebase = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'inventory'))
      const items = []
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() })
      })
      if (items.length > 0) {
        setInventory(items)
      }
    } catch (error) {
      alert('Error loading from Firebase. Check your connection and try again.')
    }
  }

  // Add product to Firebase
  const addProductToFirebase = async (product) => {
    try {
      const docRef = await addDoc(collection(db, 'inventory'), product)
      return docRef.id
    } catch (error) {
      throw error
    }
  }

  // Update product in Firebase
  const updateProductInFirebase = async (productId, updatedData) => {
    try {
      const productRef = doc(db, 'inventory', productId)
      await updateDoc(productRef, updatedData)
    } catch (error) {
      throw error
    }
  }

  // Delete product from Firebase
  const deleteProductFromFirebase = async (productId) => {
    try {
      await deleteDoc(doc(db, 'inventory', productId))
    } catch (error) {
      throw error
    }
  }

  // Initialize empty data - all data will come from Firebase or user input
  // No sample data included

  // Add item to cart
  const addToCart = async (item) => {
    const existingItem = cart.find(i => i.id === item.id)
    const currentCartQuantity = existingItem ? existingItem.quantity : 0
    
    // Check if there's enough stock
    if (currentCartQuantity >= item.stock) {
      showNotification(`Cannot add more. Only ${item.stock} ${item.unit}(s) available in stock.`, 'error')
      return
    }
    
    // Update cart
    if (existingItem) {
      setCart(cart.map(i => 
        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
      ))
    } else {
      setCart([...cart, { ...item, quantity: 1 }])
    }
    
    // Decrease inventory stock
    const newStock = item.stock - 1
    const updatedInventory = inventory.map(i => 
      i.id === item.id ? { ...i, stock: newStock } : i
    )
    setInventory(updatedInventory)
    
    // Update in Firebase
    try {
      await updateProductInFirebase(item.id, { ...item, stock: newStock })
    } catch (error) {
      // Revert inventory on error
      setInventory(inventory)
      showNotification('Error updating stock: ' + error.message, 'error')
    }
  }

  // Update cart quantity
  const updateCartQuantity = (id, quantity) => {
    if (quantity <= 0) {
      setCart(cart.filter(i => i.id !== id))
    } else {
      const item = inventory.find(i => i.id === id)
      if (item && quantity > item.stock) {
        showNotification(`Cannot add more. Only ${item.stock} ${item.unit}(s) available in stock.`, 'error')
        return
      }
      setCart(cart.map(i => i.id === id ? { ...i, quantity } : i))
    }
  }

  // Remove from cart
  const removeFromCart = (id) => {
    setCart(cart.filter(i => i.id !== id))
  }

  // Calculate cart total
  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }

  // Process sale
  const processSale = async () => {
    if (cart.length === 0) {
      showNotification('Cart is empty!', 'error')
      return
    }

    const newOrder = {
      id: orders.length > 0 ? Math.max(...orders.map(o => o.id)) + 1 : 1001,
      customer: selectedCustomer ? selectedCustomer.name : 'Walk-in Customer',
      items: cart.map(item => ({ name: item.name, qty: item.quantity, price: item.price })),
      total: getCartTotal(),
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }

    setOrders([newOrder, ...orders])
    
    try {
      // Update inventory for all items and track items to delete
      const itemsToDelete = []
      const updatedInventory = inventory.map(item => {
        const cartItem = cart.find(c => c.id === item.id)
        if (cartItem) {
          const newStock = item.stock - cartItem.quantity
          if (newStock <= 0) {
            itemsToDelete.push(item.id)
            return null // Mark for removal
          }
          return { ...item, stock: newStock }
        }
        return item
      }).filter(item => item !== null) // Remove items with 0 stock
      
      setInventory(updatedInventory)

      // Update or delete items in Firebase
      for (const cartItem of cart) {
        const inventoryItem = inventory.find(i => i.id === cartItem.id)
        if (inventoryItem) {
          const newStock = inventoryItem.stock - cartItem.quantity
          
          if (newStock <= 0) {
            // Delete item from Firebase when stock reaches 0
            await deleteProductFromFirebase(cartItem.id)
          } else {
            // Update stock in Firebase
            await updateProductInFirebase(cartItem.id, {
              name: inventoryItem.name,
              category: inventoryItem.category,
              price: inventoryItem.price,
              stock: newStock,
              unit: inventoryItem.unit
            })
          }
        }
      }

      // Show notification if items were deleted
      if (itemsToDelete.length > 0) {
        showNotification(`${itemsToDelete.length} item(s) removed from inventory (out of stock)`, 'info')
      }

      // Clear cart
      setCart([])
      setSelectedCustomer(null)
      showNotification(`Order #${newOrder.id} created successfully!`, 'success')
    } catch (error) {
      showNotification('Sale completed but stock update failed: ' + error.message, 'error')
    }
  }

  // Filter inventory
  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Filter orders
  const filteredOrders = orders.filter(order => {
    if (orderFilter === 'all') return true
    return order.status === orderFilter
  })

  // Add new customer
  const addCustomer = (customerData) => {
    const newCustomer = {
      id: customers.length > 0 ? Math.max(...customers.map(c => c.id)) + 1 : 1,
      ...customerData,
      totalOrders: 0
    }
    setCustomers([...customers, newCustomer])
    setShowCustomerModal(false)
  }

  // Update order status
  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ))
  }

  // Add or update product
  const handleSaveProduct = async (productData) => {
    try {
      if (editingProduct) {
        // Update existing product
        await updateProductInFirebase(editingProduct.id, productData)
        setInventory(inventory.map(item => 
          item.id === editingProduct.id ? { ...item, ...productData } : item
        ))
        showNotification('Product updated successfully!', 'success')
      } else {
        // Add new product
        const firebaseId = await addProductToFirebase(productData)
        const newProduct = { id: firebaseId, ...productData }
        setInventory([...inventory, newProduct])
        showNotification('Product added successfully!', 'success')
      }
      setShowAddProductModal(false)
      setEditingProduct(null)
    } catch (error) {
      showNotification('Error saving product: ' + error.message, 'error')
    }
  }

  // Delete product
  const handleDeleteProduct = (productId) => {
    showConfirmation(
      async () => {
        try {
          await deleteProductFromFirebase(productId)
          setInventory(inventory.filter(item => item.id !== productId))
          showNotification('Product deleted successfully!', 'success')
        } catch (error) {
          showNotification('Error deleting product: ' + error.message, 'error')
        }
      },
      'Delete Product',
      'Are you sure you want to delete this product? This action cannot be undone.'
    )
  }

  // Open edit modal
  const handleEditProduct = (product) => {
    setEditingProduct(product)
    setCurrentBarcode(product.barcode || generateBarcode())
    setShowAddProductModal(true)
  }

  // Generate random barcode (EAN-13 format)
  const generateBarcode = () => {
    // Generate 12 random digits
    let barcode = ''
    for (let i = 0; i < 12; i++) {
      barcode += Math.floor(Math.random() * 10)
    }
    
    // Calculate check digit for EAN-13
    let sum = 0
    for (let i = 0; i < 12; i++) {
      const digit = parseInt(barcode[i])
      sum += i % 2 === 0 ? digit : digit * 3
    }
    const checkDigit = (10 - (sum % 10)) % 10
    
    return barcode + checkDigit
  }

  // Show loading spinner
  if (isLoading) {
    return (
      <div className="app">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  // Show login page if not authenticated
  if (!user) {
    return (
      <div className="app">
        {/* Notification Toast */}
        {notification && (
          <div className={`notification ${notification.type}`}>
            <div className="notification-content">
              <span className="notification-icon">
                {notification.type === 'success' && '✅'}
                {notification.type === 'error' && '⚠️'}
                {notification.type === 'info' && 'ℹ️'}
              </span>
              <span className="notification-message">{notification.message}</span>
            </div>
            <button className="notification-close" onClick={() => setNotification(null)}>✕</button>
          </div>
        )}

        <div className="login-container">
          <div className="login-card">
            <div className="login-header">
              <div className="login-icon">🧵</div>
              <h1>Embroidery POS</h1>
              <p>Sign in to your account</p>
            </div>

            <form className="login-form" onSubmit={handleLogin}>
              <div className="form-field">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>

              {loginError && (
                <div className="login-error">
                  <span>⚠️</span>
                  {loginError}
                </div>
              )}

              <button type="submit" className="login-button">
                Sign In
              </button>
            </form>

            <div className="login-footer">
              <p>Secure login powered by Firebase</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      {/* Notification Toast */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          <div className="notification-content">
            <span className="notification-icon">
              {notification.type === 'success' && '✅'}
              {notification.type === 'error' && '⚠️'}
              {notification.type === 'info' && 'ℹ️'}
            </span>
            <span className="notification-message">{notification.message}</span>
          </div>
          <button className="notification-close" onClick={() => setNotification(null)}>✕</button>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="modal-overlay" onClick={handleCancel}>
          <div className="confirmation-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="confirmation-icon">⚠️</div>
            <h3>{confirmMessage.title}</h3>
            <p>{confirmMessage.message}</p>
            <div className="confirmation-actions">
              <button className="btn-cancel" onClick={handleCancel}>
                Cancel
              </button>
              <button className="btn-confirm" onClick={handleConfirm}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="header-left">
            <h1>🧵 Embroidery POS System</h1>
            <div className={`scanner-indicator ${barcodeDetected ? 'active' : ''}`}>
              <span className="indicator-dot"></span>
              <span className="indicator-text">Scanner</span>
            </div>
          </div>
          <div className="header-info">
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            <button className="logout-button" onClick={handleLogout}>
              <span>🚪</span>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="nav-tabs">
        <button 
          className={activeTab === 'pos' ? 'active' : ''} 
          onClick={() => setActiveTab('pos')}
        >
          💳 Point of Sale
        </button>
        <button 
          className={activeTab === 'orders' ? 'active' : ''} 
          onClick={() => setActiveTab('orders')}
        >
          📋 Sale History
        </button>
        {userRole === 'Admin' && (
          <>
            <button 
              className={activeTab === 'inventory' ? 'active' : ''} 
              onClick={() => setActiveTab('inventory')}
            >
              📦 Inventory
            </button>
            <button 
              className={activeTab === 'reports' ? 'active' : ''} 
              onClick={() => setActiveTab('reports')}
            >
              📊 Reports
            </button>
            <button 
              className={activeTab === 'admin' ? 'active' : ''} 
              onClick={() => setActiveTab('admin')}
            >
              🔧 Admin
            </button>
          </>
        )}
      </nav>

      {/* Main Content */}
      <main className="main-content">
        {/* Point of Sale Tab */}
        {activeTab === 'pos' && (
          <div className="pos-container">
            <div className="pos-left">
              <div className="search-bar">
                <input
                  type="text"
                  placeholder="🔍 Search products or services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="product-grid">
                {filteredInventory.map(item => (
                  <div key={item.id} className="product-card" onClick={() => addToCart(item)}>
                    <div className="product-category">{item.category}</div>
                    <h3>{item.name}</h3>
                    <div className="product-footer">
                      <span className="price">${item.price.toFixed(2)}</span>
                      <span className="stock">Stock: {item.stock}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pos-right">
              <div className="cart">
                <h2>Cart</h2>

                <div className="cart-items">
                  {cart.length === 0 ? (
                    <p className="empty-cart">Cart is empty</p>
                  ) : (
                    cart.map(item => (
                      <div key={item.id} className="cart-item">
                        <div className="item-info">
                          <span className="item-name">{item.name}</span>
                          <span className="item-price">${item.price.toFixed(2)}</span>
                        </div>
                        <div className="item-controls">
                          <button onClick={() => updateCartQuantity(item.id, item.quantity - 1)}>−</button>
                          <span>{item.quantity}</span>
                          <button onClick={() => updateCartQuantity(item.id, item.quantity + 1)}>+</button>
                          <button className="remove-btn" onClick={() => removeFromCart(item.id)}>🗑️</button>
                        </div>
                        <div className="item-total">${(item.price * item.quantity).toFixed(2)}</div>
                      </div>
                    ))
                  )}
                </div>

                <div className="cart-summary">
                  <div className="summary-row">
                    <span>Subtotal:</span>
                    <span>${getCartTotal().toFixed(2)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Tax (8%):</span>
                    <span>${(getCartTotal() * 0.08).toFixed(2)}</span>
                  </div>
                  <div className="summary-row total">
                    <span>Total:</span>
                    <span>${(getCartTotal() * 1.08).toFixed(2)}</span>
                  </div>
                </div>

                <div className="cart-actions">
                  <button className="btn-clear" onClick={() => setCart([])}>Clear Cart</button>
                  <button className="btn-checkout" onClick={processSale}>Complete Sale</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sale History Tab */}
        {activeTab === 'orders' && (
          <div className="orders-container">
            <div className="orders-header">
              <h2>Completed Sale History</h2>
            </div>

            <div className="orders-list">
              {filteredOrders.map(order => (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <div>
                      <h3>Order #{order.id}</h3>
                      <p className="order-customer">{order.customer}</p>
                    </div>
                    <div className="order-status">
                      <span className="status-badge completed">
                        Completed
                      </span>
                    </div>
                  </div>
                  <div className="order-items">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="order-item-row">
                        <span>{item.name}</span>
                        <span>Qty: {item.qty}</span>
                        <span>${(item.price * item.qty).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="order-footer">
                    <div>
                      <small>Order Date: {order.date}</small><br/>
                      <small>Due Date: {order.dueDate}</small>
                    </div>
                    <div className="order-total">Total: ${order.total.toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div className="inventory-container">
            <h2>Inventory Management</h2>
            <div className="inventory-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Unit</th>
                    <th>Barcode</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map(item => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{item.name}</td>
                      <td><span className="category-badge">{item.category}</span></td>
                      <td>${item.price.toFixed(2)}</td>
                      <td>{item.stock}</td>
                      <td>{item.unit}</td>
                      <td>
                        <code style={{ background: '#f7fafc', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem' }}>
                          {item.barcode || 'N/A'}
                        </code>
                      </td>
                      <td>
                        <span className={`stock-status ${item.stock < 10 ? 'low' : 'good'}`}>
                          {item.stock < 10 ? '⚠️ Low Stock' : '✓ In Stock'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="reports-container">
            <div className="reports-header">
              <h2>Sales Reports & Analytics</h2>
              <button className="btn-download" onClick={downloadReports}>
                📥 Download Report
              </button>
            </div>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">💰</div>
                <div className="stat-content">
                  <h3>Total Revenue</h3>
                  <p className="stat-value">${orders.reduce((sum, o) => sum + o.total, 0).toFixed(2)}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📋</div>
                <div className="stat-content">
                  <h3>Total Orders</h3>
                  <p className="stat-value">{orders.length}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📦</div>
                <div className="stat-content">
                  <h3>Inventory Items</h3>
                  <p className="stat-value">{inventory.length}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-content">
                  <h3>Completed Orders</h3>
                  <p className="stat-value">{orders.filter(o => o.status === 'completed').length}</p>
                </div>
              </div>
            </div>

            {/* Sales by Day Chart */}
            <div className="sales-chart-container">
              <div className="chart-header">
                <h3>Sales by Day</h3>
                <div className="month-selector">
                  <label>Select Month:</label>
                  <input 
                    type="month" 
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    max={new Date().toISOString().slice(0, 7)}
                  />
                </div>
              </div>
              <div className="chart">
                {(() => {
                  // Group sales by date
                  const salesByDay = {}
                  orders.forEach(order => {
                    const date = order.date
                    if (!salesByDay[date]) {
                      salesByDay[date] = 0
                    }
                    salesByDay[date] += order.total
                  })

                  // Get all days in selected month
                  const [year, month] = selectedMonth.split('-').map(Number)
                  const daysInMonth = new Date(year, month, 0).getDate()
                  const monthDays = []
                  
                  for (let day = 1; day <= daysInMonth; day++) {
                    const date = `${selectedMonth}-${String(day).padStart(2, '0')}`
                    monthDays.push(date)
                  }

                  const chartData = monthDays.map(date => ({
                    date,
                    amount: salesByDay[date] || 0
                  }))

                  const maxAmount = Math.max(...chartData.map(d => d.amount), 1)
                  const totalSales = chartData.reduce((sum, d) => sum + d.amount, 0)

                  return (
                    <div className="line-chart">
                      <div className="chart-summary">
                        <span>Total Sales for {new Date(selectedMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}: <strong>${totalSales.toFixed(2)}</strong></span>
                      </div>
                      <div className="chart-bars-wrapper">
                        <div className="chart-bars">
                          {chartData.map((data, idx) => (
                            <div key={idx} className="bar-container">
                              <div className="bar-wrapper">
                                <div 
                                  className="bar" 
                                  style={{ height: `${(data.amount / maxAmount) * 100}%` }}
                                  title={`${new Date(data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}: $${data.amount.toFixed(2)}`}
                                >
                                  {data.amount > 0 && <span className="bar-value">${data.amount.toFixed(0)}</span>}
                                </div>
                              </div>
                              <div className="bar-label">
                                {new Date(data.date).getDate()}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                })()}
              </div>
            </div>

            </div>
        )}

        {/* Admin Tab */}
        {activeTab === 'admin' && (
          <div className="admin-container">
            <div className="admin-header">
              <h2>Admin Panel - Product & Service Management</h2>
              <button 
                className="btn-add" 
                onClick={() => {
                  setEditingProduct(null)
                  setCurrentBarcode(generateBarcode())
                  setShowAddProductModal(true)
                }}
              >
                + Add Product/Service
              </button>
            </div>

            <div className="admin-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Unit</th>
                    <th>Barcode</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map(item => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{item.name}</td>
                      <td><span className="category-badge">{item.category}</span></td>
                      <td>${item.price.toFixed(2)}</td>
                      <td>{item.stock}</td>
                      <td>{item.unit}</td>
                      <td>
                        <code style={{ background: '#f7fafc', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem' }}>
                          {item.barcode || 'N/A'}
                        </code>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="btn-edit" 
                            onClick={() => handleEditProduct(item)}
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button 
                            className="btn-delete" 
                            onClick={() => handleDeleteProduct(item.id)}
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add/Edit Product Modal */}
            {showAddProductModal && (
              <div className="modal-overlay" onClick={() => {
                setShowAddProductModal(false)
                setEditingProduct(null)
              }}>
                <div className="modal product-modal" onClick={(e) => e.stopPropagation()}>
                  <h2>{editingProduct ? 'Edit Product/Service' : 'Add New Product/Service'}</h2>
                  <form onSubmit={(e) => {
                    e.preventDefault()
                    const formData = new FormData(e.target)
                    handleSaveProduct({
                      name: formData.get('name'),
                      category: formData.get('category'),
                      price: parseFloat(formData.get('price')),
                      stock: parseInt(formData.get('stock')),
                      unit: formData.get('unit'),
                      barcode: formData.get('barcode')
                    })
                  }}>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Product/Service Name *</label>
                        <input 
                          name="name" 
                          placeholder="e.g., Custom Logo Embroidery" 
                          defaultValue={editingProduct?.name || ''}
                          required 
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Category *</label>
                        <select 
                          name="category" 
                          defaultValue={editingProduct?.category || 'Service'}
                          required
                        >
                          <option value="Service">Service</option>
                          <option value="Thread">Thread</option>
                          <option value="Blank">Blank</option>
                          <option value="Supply">Supply</option>
                        </select>
                      </div>
                      
                      <div className="form-group">
                        <label>Price ($) *</label>
                        <input 
                          name="price" 
                          type="number" 
                          step="0.01" 
                          min="0"
                          placeholder="0.00" 
                          defaultValue={editingProduct?.price || ''}
                          required 
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Stock Quantity *</label>
                        <input 
                          name="stock" 
                          type="number" 
                          min="0"
                          placeholder="0" 
                          defaultValue={editingProduct?.stock || ''}
                          required 
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Unit *</label>
                        <input 
                          name="unit" 
                          placeholder="e.g., item, spool, roll" 
                          defaultValue={editingProduct?.unit || 'item'}
                          required 
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Barcode</label>
                        <input 
                          name="barcode" 
                          placeholder="Auto-generated" 
                          value={currentBarcode}
                          onChange={(e) => setCurrentBarcode(e.target.value)}
                          readOnly={!editingProduct}
                          style={{ background: editingProduct ? 'white' : '#f7fafc', cursor: editingProduct ? 'text' : 'not-allowed' }}
                        />
                        <small style={{ color: '#718096', fontSize: '0.85rem' }}>
                          {editingProduct ? 'Edit if needed' : 'Auto-generated on save'}
                        </small>
                      </div>
                    </div>
                    
                    <div className="modal-actions">
                      <button 
                        type="button" 
                        onClick={() => {
                          setShowAddProductModal(false)
                          setEditingProduct(null)
                        }}
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn-primary">
                        {editingProduct ? 'Update' : 'Add'} Product
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default App
