# 🧵 Embroidery POS System

A comprehensive Point of Sale (POS) system specifically designed for embroidery businesses. Built with React and Vite for a modern, fast, and intuitive user experience.

## ✨ Features

### 💳 Point of Sale
- **Product Grid**: Browse embroidery services, threads, blank products, and supplies
- **Smart Search**: Quickly find products by name or category
- **Shopping Cart**: Add items with quantity controls
- **Customer Selection**: Assign orders to existing customers or walk-ins
- **Tax Calculation**: Automatic 8% tax calculation
- **Quick Checkout**: Process sales with one click

### 📋 Order Management
- **Order Tracking**: Monitor all orders with filtering by status
- **Status Updates**: Change order status (Pending → In Progress → Completed)
- **Order Details**: View complete order information including items, dates, and totals
- **Due Date Tracking**: Keep track of custom embroidery job deadlines

### 📦 Inventory Management
- **Complete Inventory View**: Table display of all products and services
- **Stock Levels**: Real-time stock tracking with low stock warnings
- **Categories**: Organized by Service, Thread, Blank, and Supply
- **Automatic Updates**: Inventory adjusts when sales are processed

### 👥 Customer Management
- **Customer Database**: Store customer information (name, email, phone)
- **Add New Customers**: Easy customer registration via modal form
- **Order History**: Track total orders per customer
- **Customer Cards**: Visual display of customer information

### 📊 Reports & Analytics
- **Revenue Tracking**: Total revenue from all orders
- **Order Statistics**: Total orders, pending, and completed counts
- **Customer Metrics**: Track total customer base
- **Inventory Overview**: Monitor total inventory items
- **Recent Activity**: View the latest 5 orders at a glance

### 🔧 Admin Panel (NEW!)
- **Product Management**: Add, edit, and delete products/services
- **Firebase Integration**: Optional cloud storage for inventory
- **Local/Cloud Toggle**: Switch between local and Firebase storage
- **Real-time Updates**: Changes sync instantly when using Firebase
- **Category Management**: Organize products by Service, Thread, Blank, or Supply
- **Bulk Management**: Manage all inventory from one interface

## 🎨 Sample Data Included

### Embroidery Services
- Custom Logo Embroidery ($25.00)
- Name Embroidery ($15.00)
- Monogram Embroidery ($18.00)
- Patch Creation & Application ($30.00)
- Digitizing Service ($50.00)

### Products & Supplies
- Polyester & Metallic Threads
- Blank Products (Polo Shirts, Caps, Tote Bags, Aprons)
- Embroidery Hoops & Stabilizers
- Needles and Tools

## 🔥 Firebase Setup (Optional)

To enable cloud-based product management:

1. Install Firebase:
```bash
npm install firebase
```

2. Follow the detailed setup guide in [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)

3. Configure your Firebase credentials in `src/firebase.js`

4. Enable Firebase in the Admin tab

**Note**: The app works perfectly without Firebase in local mode!

## 🚀 Getting Started

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 🛠️ Technology Stack

- **React 19**: Modern UI library with hooks
- **Vite**: Lightning-fast build tool and dev server
- **CSS3**: Custom styling with gradients and animations
- **ES6+**: Modern JavaScript features

## 📱 User Interface

- **Responsive Design**: Works on desktop and tablet devices
- **Modern UI**: Gradient backgrounds and smooth transitions
- **Intuitive Navigation**: Tab-based interface for easy access
- **Color-Coded Status**: Visual indicators for order and inventory status
- **Interactive Elements**: Hover effects and smooth animations

## 💡 Usage Tips

1. **Processing Sales**: Navigate to Point of Sale → Select products → Choose customer (optional) → Complete Sale
2. **Managing Orders**: Go to Orders tab → Filter by status → Update order status via dropdown
3. **Adding Customers**: Click "+ Add Customer" in Customers tab → Fill form → Submit
4. **Monitoring Stock**: Check Inventory tab for low stock warnings (⚠️ indicates items with less than 10 units)
5. **Viewing Analytics**: Reports tab shows real-time business metrics and recent activity
6. **Managing Products**: Go to Admin tab → Add/Edit/Delete products → Toggle Firebase for cloud storage

## 🎯 Future Enhancements

- Payment processing integration
- Receipt printing functionality
- Advanced reporting with date ranges and charts
- Inventory reorder alerts and management
- Customer loyalty program
- Design file upload and management
- Multi-user support with authentication
- Export data to CSV/Excel

## 📄 License

MIT License - Feel free to use this for your embroidery business!

---

Built with ❤️ for embroidery businesses
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.
Note: This will impact Vite dev & build performances.

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
