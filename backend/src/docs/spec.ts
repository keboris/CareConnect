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
      url: "http://localhost:8080",
      description: "Local development server",
    },
    {
      url: "https://careconnect-backend-hox4.onrender.com",
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
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user",
        requestBody: {
          description: "User registration data",
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/AuthRegisterInput",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "User registered successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/User",
                },
              },
            },
          },
          "400": {
            description: "Invalid input data",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "accessToken",
        description: "Authentication token stored in cookies",
      },
    },
    schemas: {
      ErrorResponse: {
        type: "object",
        properties: {
          message: { type: "string" },
          issues: {
            type: "array",
            items: {
              type: "object",
              properties: {
                path: { type: "string" },
                message: { type: "string" },
              },
            },
          },
        },
      },

      UserRegistration: {
        type: "object",
        properties: {
          message: { type: "string" },
          issues: {
            type: "array",
            items: {
              type: "object",
              properties: {
                path: { type: "string" },
                message: { type: "string" },
              },
            },
          },
        },
      },

      AuthLoginInput: {
        type: "object",
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string", format: "password" },
        },
        required: ["email", "password"],
      },

      AuthRegisterInput: {
        type: "object",
        properties: {
          firstName: { type: "string" },
          lastName: { type: "string" },
          email: { type: "string", format: "email" },
          password: { type: "string", format: "password" },
          phone: { type: "string" },
          bio: { type: "string" },
          skills: { type: "array", items: { type: "string" } },
          languages: { type: "array", items: { type: "string" } },
          location: { type: "string" },
        },
        required: [
          "firstName",
          "lastName",
          "email",
          "password",
          "phone",
          "location",
        ],
      },

      User: {
        type: "object",
        properties: {
          id: { type: "string", pattern: "mongooseValid" },
          firstName: { type: "string", minLength: 2, maxLength: 100 },
          lastName: { type: "string", minLength: 2, maxLength: 100 },
          email: { type: "string", format: "email" },
          phone: { type: "string" },
          bio: { type: "string" },
          skills: { type: "array", items: { type: "string" } },
          languages: { type: "array", items: { type: "string" } },
          location: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
        },
      },

      Offer: {
        type: "object",
        properties: {
          userId: { type: "string", pattern: "mongooseValid" },
          title: { type: "string", minLength: 5, maxLength: 100 },
          description: { type: "string", minLength: 10, maxLength: 1000 },
          categoryId: { type: "string", pattern: "mongooseValid" },
          isPaid: { type: "boolean" },
          price: { type: "number", minimum: 0 },
          location: { type: "string" },
          longitude: { type: "number", minimum: -180, maximum: 180 },
          latitude: { type: "number", minimum: -90, maximum: 90 },
          availability: { type: "string" },
          images: { type: "array", items: { type: "string", format: "uri" } },
          status: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
        },
        required: ["userId", "title", "description", "categoryId", "location"],
      },

      Request: {
        oneOf: [
          {
            type: "object",
            properties: {
              userId: { type: "string", pattern: "mongooseValid" },
              title: { type: "string", minLength: 5, maxLength: 100 },
              description: { type: "string", minLength: 10, maxLength: 1000 },
              typeRequest: { type: "string", enum: ["request"] },
              categoryId: { type: "string", pattern: "mongooseValid" },
              location: { type: "string" },
              longitude: { type: "number", minimum: -180, maximum: 180 },
              latitude: { type: "number", minimum: -90, maximum: 90 },
              rewardType: { type: "string", enum: ["free", "paid"] },
              price: { type: "number", minimum: 0 },
              createdAt: { type: "string", format: "date-time" },
            },
            required: [
              "userId",
              "title",
              "description",
              "typeRequest",
              "categoryId",
              "location",
              "longitude",
              "latitude",
            ],
          },
          {
            type: "object",
            properties: {
              userId: { type: "string", pattern: "mongooseValid" },
              title: { type: "string", minLength: 5, maxLength: 100 },
              description: { type: "string", minLength: 10, maxLength: 1000 },
              typeRequest: { type: "string", enum: ["alert"] },
              categoryId: { type: "string", pattern: "mongooseValid" },
              location: { type: "string" },
              longitude: { type: "number", minimum: -180, maximum: 180 },
              latitude: { type: "number", minimum: -90, maximum: 90 },
              rewardType: { type: "string", enum: ["free"] },
              price: { type: "number", minimum: 0 },
              createdAt: { type: "string", format: "date-time" },
            },
            required: [
              "userId",
              "typeRequest",
              "categoryId",
              "location",
              "longitude",
              "latitude",
            ],
          },
        ],
      },
    },
  },
};
