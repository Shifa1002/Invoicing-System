import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Invoice Management System API',
      version: '1.0.0',
      description: 'API documentation for the Invoice Management System',
      contact: {
        name: 'API Support',
        email: 'support@invoicemanagement.com'
      }
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:5000/api',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Error message'
            }
          }
        },
        Pagination: {
          type: 'object',
          properties: {
            total: {
              type: 'integer',
              description: 'Total number of items'
            },
            page: {
              type: 'integer',
              description: 'Current page number'
            },
            pages: {
              type: 'integer',
              description: 'Total number of pages'
            }
          }
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: [
    './server/routes/*.js',
    './server/controllers/*.js',
    './server/models/*.js'
  ]
};

const specs = swaggerJsdoc(options);

export const swaggerSetup = (app) => {
  // Swagger UI
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Invoice Management System API Documentation'
  }));

  // Swagger JSON
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });
}; 