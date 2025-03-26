const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { SwaggerTheme, SwaggerThemeNameEnum } = require('swagger-themes');

// Swagger definition
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Mirai API',
      version: '1.0.0',
      description: 'API documentation for Mirai Bot services',
      contact: {
        name: 'API Support'
      },
    },
    servers: [
      {
        url: 'http://localhost:8080',
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        Error: {
          type: 'object',
          properties: {
            status: {
              type: 'integer',
              example: 500
            },
            message: {
              type: 'string',
              example: 'Server error'
            },
            error: {
              type: 'string',
              example: 'Error details'
            }
          }
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'integer',
              example: 200
            },
            result: {
              type: 'object',
              example: {}
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js'], // Path to the API docs
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJsdoc(swaggerOptions);
const theme = new SwaggerTheme();

// Function to setup our docs
const swaggerDocs = (app) => {
  // Route for swagger docs
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: theme.getBuffer(SwaggerThemeNameEnum.MUTED),
    customSiteTitle: 'Mirai API Documentation',
    customfavIcon: '',
    swaggerOptions: {
      docExpansion: 'none',
      filter: true,
      defaultModelsExpandDepth: -1
    }
  }));
  
  // Documentation in JSON format
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
  
  console.log(`📚 Swagger docs available at http://localhost:8080/api-docs`);
};

module.exports = { swaggerDocs };