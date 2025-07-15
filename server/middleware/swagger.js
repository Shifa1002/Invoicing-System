// server/middleware/swagger.js
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve __dirname in ES module context
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Swagger definition (OpenAPI 3.0)
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Invoicing System API',
    version: '1.0.0',
    description: 'API documentation for the Invoicing System with JWT Authentication',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
    // You can add your deployed server URL here
    // {
    //   url: 'https://your-backend.onrender.com',
    //   description: 'Production server',
    // },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

// Swagger-jsdoc options
const options = {
  swaggerDefinition,
  apis: [path.join(__dirname, '../routes/*.js')], // All route files
};

// Generate specs
const specs = swaggerJsdoc(options);

/**
 * Function to mount Swagger on an Express app
 * @param {Express.Application} app - Express app instance
 */
const setupSwagger = (app) => {
  if (!app || typeof app.use !== 'function') {
    throw new Error('Express app instance is required to set up Swagger');
  }

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
  console.log('📘 Swagger docs available at http://localhost:3000/api-docs');
};

export default setupSwagger;
