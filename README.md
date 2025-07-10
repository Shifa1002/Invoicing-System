# MERN Invoicing System

A comprehensive, production-ready invoicing and contract management system built with the MERN stack (MongoDB, Express.js, React.js, Node.js).

## 🚀 Features

### Core Functionality
- **Client Management**: Add, edit, and manage client information
- **Product/Service Catalog**: Maintain product and service listings
- **Contract Management**: Create and manage client contracts
- **Invoice Generation**: Generate professional invoices with payment tracking
- **Payment Tracking**: Track payment status, modes, and due dates

### Advanced Features
- **Dashboard Analytics**: Real-time statistics and revenue tracking
- **PDF Export**: Generate professional PDF invoices and contracts
- **CSV Export**: Export data for external analysis
- **Email Automation**: Send invoices and contracts via email
- **Payment Modes**: Support for UPI, Bank Transfer, Credit Card, Cash, etc.
- **Search & Pagination**: Advanced filtering and search capabilities
- **Responsive Design**: Mobile-friendly interface

### Security & Performance
- **JWT Authentication**: Secure user authentication
- **CORS Protection**: Cross-origin request handling
- **Rate Limiting**: API protection against abuse
- **Input Validation**: Comprehensive data validation
- **Error Handling**: Robust error management

## 🛠️ Tech Stack

### Frontend
- **React 18**: Modern React with hooks
- **Material-UI**: Professional UI components
- **React Router**: Client-side routing
- **Axios**: HTTP client for API calls
- **Notistack**: Toast notifications

### Backend
- **Node.js**: Server runtime
- **Express.js**: Web framework
- **MongoDB**: NoSQL database
- **Mongoose**: ODM for MongoDB
- **JWT**: Authentication
- **Nodemailer**: Email functionality
- **PDFKit**: PDF generation
- **json2csv**: CSV export

### Deployment
- **Netlify**: Frontend hosting
- **Render**: Backend hosting
- **MongoDB Atlas**: Cloud database

## 📦 Installation

### Prerequisites
- Node.js >= 16.0.0
- npm >= 8.0.0
- MongoDB database

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Shifa1002/Invoicing-System.git
   cd Invoicing-System/server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the server directory:
   ```env
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/invoicing-system
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRE=30d
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   FRONTEND_URL=https://invoicing-system-2025.netlify.app
   ```

4. **Start the server**
   ```bash
   npm start
   ```

### Frontend Setup

1. **Navigate to client directory**
   ```bash
   cd ../client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the client directory:
   ```env
   REACT_APP_API_BASE_URL=https://invoicing-system-mruw.onrender.com/api
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

## 🚀 Deployment

### Backend (Render)

1. **Connect your GitHub repository to Render**
2. **Create a new Web Service**
3. **Configure environment variables**
4. **Set build command**: `npm install`
5. **Set start command**: `npm start`

### Frontend (Netlify)

1. **Connect your GitHub repository to Netlify**
2. **Set build settings**:
   - Build command: `cd client && npm install && npm run build`
   - Publish directory: `client/build`
3. **Configure environment variables**
4. **Deploy**

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Dashboard
- `GET /api/dashboard` - Dashboard statistics
- `GET /api/dashboard/revenue` - Revenue analytics
- `GET /api/dashboard/clients` - Client analytics

### Clients
- `GET /api/clients` - Get all clients
- `POST /api/clients` - Create client
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Contracts
- `GET /api/contracts` - Get all contracts
- `POST /api/contracts` - Create contract
- `PUT /api/contracts/:id` - Update contract
- `DELETE /api/contracts/:id` - Delete contract
- `GET /api/contracts/export/csv` - Export contracts as CSV
- `GET /api/contracts/:id/export/pdf` - Export contract as PDF
- `POST /api/contracts/:id/send-email` - Send contract via email

### Invoices
- `GET /api/invoices` - Get all invoices
- `POST /api/invoices` - Create invoice
- `PUT /api/invoices/:id` - Update invoice
- `DELETE /api/invoices/:id` - Delete invoice
- `GET /api/invoices/export/csv` - Export invoices as CSV
- `GET /api/invoices/:id/export/pdf` - Export invoice as PDF
- `POST /api/invoices/:id/send-email` - Send invoice via email

## 🎨 Features Overview

### Dashboard
- Total revenue, invoices, contracts, and clients
- Invoice status breakdown (paid, pending, overdue)
- Recent activity feed
- Top clients by revenue
- Monthly revenue trends

### Invoice Management
- Create invoices from contracts
- Multiple payment modes (UPI, Bank Transfer, Credit Card, Cash)
- Payment tracking and status updates
- PDF and CSV export
- Email automation

### Contract Management
- Comprehensive contract creation
- Status tracking (draft, active, completed, cancelled)
- Payment terms and billing cycles
- Auto-renewal settings
- PDF export and email functionality

### Client Management
- Complete client profiles
- Contact information management
- Client activity tracking
- Revenue analytics per client

## 🔧 Configuration

### Email Setup
Configure SMTP settings in your environment variables:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Database Setup
Use MongoDB Atlas or local MongoDB:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/invoicing-system
```

### JWT Configuration
Set secure JWT secret:
```env
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=30d
```

## 🛡️ Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- Rate limiting
- Input validation and sanitization
- Helmet.js security headers
- Environment variable protection

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- All modern browsers

## 🚀 Performance Optimizations

- Code splitting and lazy loading
- Optimized bundle size
- Efficient database queries
- Caching strategies
- Compression middleware
- CDN-ready static assets

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation

## 🔄 Version History

- **v1.0.0**: Initial production release
  - Complete CRUD operations
  - Dashboard analytics
  - PDF/CSV export
  - Email automation
  - Payment tracking
  - Responsive design

---

**Built with ❤️ using the MERN stack** 