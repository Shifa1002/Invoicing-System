import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve __dirname in ES module context
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Swagger definition
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Invoice Management API',
    version: '1.0.0',
    description: 'API for managing invoices with JWT authentication',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
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

// Options for swagger-jsdoc
const options = {
  swaggerDefinition,
  apis: [path.join(__dirname, '../routes/*.js')], 
};

// Generate Swagger specification
const swaggerSpec = swaggerJSDoc(options);

/**
 * Function to setup Swagger on an Express app
 * @param {Express.Application} app - The Express app instance
 */
function setupSwagger(app) {
  if (!app || typeof app.use !== 'function') {
    throw new Error('Express app instance is required to setup Swagger');
  }

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log('📘 Swagger docs available at http://localhost:3000/api-docs');
}

export default setupSwagger;
