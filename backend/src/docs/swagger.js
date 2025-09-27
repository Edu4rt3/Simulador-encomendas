import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Drone Delivery API',
      version: '1.0.0',
    },
  },
  apis: ['./src/routes/*.js'],
};

export const specs = swaggerJsdoc(options);