// docs/swagger.js
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path');

// Basic swagger definition
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'PortHealth API Documentation',
    version: '1.0.0',
    description: 'API documentation for PortHealth backend'
  },
  servers: [
    { url: '/api', description: 'Base URL for API endpoints' }
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  },
  security: [ { BearerAuth: [] } ]  // apply Bearer auth globally
};

const options = {
  swaggerDefinition,
  apis: [path.join(__dirname, '../routes/*.js')]  // path to the API docs (our route files)
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = {
  swaggerUi,
  swaggerSpec
};
