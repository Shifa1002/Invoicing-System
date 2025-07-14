# IMPORTANT: Set REACT_APP_API_BASE_URL in Netlify/Render environment variables to your deployed backend URL (e.g., https://your-backend.onrender.com)

# Invoicing System

A full-stack MERN (MongoDB, Express.js, React.js, Node.js) application for managing invoices, clients, products, and contracts.

## Features

- User authentication and authorization
- CRUD operations for invoices, clients, products, and contracts
- Real-time dashboard with statistics and charts
- PDF invoice generation and download
- API documentation with Swagger
- Rate limiting and security features
- File upload for company logo
- WebSocket for real-time updates

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- Redis (v6 or higher)
- npm or yarn

## Project Structure

```
invoicing-system/
├── client/                 # React frontend
├── server/                 # Node.js backend
│   ├── config/            # Configuration files
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Custom middleware
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   ├── utils/            # Utility functions
│   ├── uploads/          # File uploads
│   ├── logs/             # Application logs
│   └── index.js          # Server entry point
└── README.md
```

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd invoicing-system
   ```

2. Install dependencies:
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. Environment Setup:
   - Create a `.env` file in the `server` directory
   - Copy the contents from `.env.example` and fill in your values
   - Required environment variables are listed in the `.env.example` file

4. Database Setup:
   - Ensure MongoDB is running
   - Create a database named `invoicing-system`
   - The application will create necessary collections automatically

5. Redis Setup:
   - Ensure Redis server is running
   - Default connection URL: `redis://localhost:6379`

6. Start the development servers:
   ```bash
   # Start backend server (from server directory)
   npm run dev

   # Start frontend server (from client directory)
   npm start
   ```

7. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api
   - API Documentation: http://localhost:5000/api-docs

## API Documentation

The API documentation is available at `/api-docs` when the server is running. It provides detailed information about all available endpoints, request/response formats, and authentication requirements.

## Available Scripts

### Server

- `npm start`: Start the production server
- `npm run dev`: Start the development server with hot reload
- `npm test`: Run tests
- `npm run lint`: Run ESLint
- `npm run format`: Format code with Prettier

### Client

- `npm start`: Start the development server
- `npm build`: Build for production
- `npm test`: Run tests
- `npm run lint`: Run ESLint
- `npm run format`: Format code with Prettier

## Security Features

- JWT authentication
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation
- File upload restrictions
- Error handling and logging

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 
