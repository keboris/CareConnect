import type { OpenAPIV3 } from "openapi-types";

export const spec: OpenAPIV3.Document = {
  openapi: "3.0.0",
  info: {
    title: "CareConnect API",
    version: "1.0.0",
    description: "API documentation for the CareConnect application",
  },
  servers: [
    {
      url: "http://localhost:8080/api",
      description: "Local development server",
    },
    {
      url: "https://api.careconnect.com/api",
      description: "Production server",
    },
  ],
  tags: [
    {
      name: "Auth",
    },
    {
      name: "Users",
    },
    {
      name: "Offers",
    },
    {
      name: "Requests",
    },
    { name: "Categories" },
  ],
  paths: {
    //
    /*'/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        requestBody: {
          description: 'User registration data',
            required: true,
            content: {
              'application/json': {
                schema: {
                    $ref: '#/components/schemas/UserRegistration',
                },
              },
            },
        },
        responses: {
            '201': {   
                description: 'User registered successfully',
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/User',
                        },
                    },
                },
            },
        },  */
  },
  components: {},
};
