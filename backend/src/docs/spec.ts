import { Category, HelpSession, Language, Notification, Skill } from "#models";
import type { OpenAPIV3 } from "openapi-types";
import { title } from "process";
import { id } from "zod/locales";

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
    { name: "Help Sessions" },
    { name: "Languages & Skills" },
    { name: "Notifications" },
    { name: "Chat Messages" },
  ],
  paths: {
    // Auth Routes Documentation
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

    // Added login route documentation
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login a user",
        requestBody: {
          description: "User login data",
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/AuthLoginInput",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "User logged in successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/User",
                },
              },
            },
          },
          "401": {
            description: "Invalid email or password",
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

    // Added me route documentation
    "/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Get current authenticated user",
        security: [{ cookieAuth: [] }],
        responses: {
          "200": {
            description: "Current user data",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/User",
                },
              },
            },
          },
          "401": {
            description: "Unauthorized",
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

    // Added logout route documentation
    "/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Logout the current user",
        security: [{ cookieAuth: [] }],
        responses: {
          "200": {
            description: "User logged out successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                  },
                },
              },
            },
          },
          "401": {
            description: "Unauthorized",
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

    // Added refresh route documentation
    "/auth/refresh": {
      post: {
        tags: ["Auth"],
        summary: "Refresh authentication token",
        security: [{ cookieAuth: [] }],
        responses: {
          "200": {
            description: "Token refreshed successfully",
          },
          "401": {
            description: "Invalid or expired refresh token",
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

    // Added logout-all route documentation
    "/logout-all": {
      post: {
        tags: ["Auth"],
        summary: "Logout from all devices",
        security: [{ cookieAuth: [] }],
        responses: {
          "200": {
            description: "User logged out from all devices successfully",
          },
          "401": {
            description: "Unauthorized",
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

    // User Routes Documentation
    "/users": {
      get: {
        tags: ["Users"],
        summary: "Get all users",
        responses: {
          "200": {
            description: "List of users",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/User" },
                },
              },
            },
          },
        },
      },
    },

    // User by ID route documentation
    "/users/{id}": {
      // Get User by ID route documentation
      get: {
        tags: ["Users"],
        summary: "Get user by ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", pattern: "mongooseValid" },
            description: "ID of the user to retrieve",
          },
        ],
        responses: {
          "200": {
            description: "User data",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/User" },
              },
            },
          },
          "404": {
            description: "User not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },

      // Update User by ID route documentation
      put: {
        tags: ["Users"],
        summary: "Update user by ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", pattern: "mongooseValid" },
            description: "ID of the user to update",
          },
        ],
        requestBody: {
          description: "User update data",
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UserInput" },
            },
          },
        },
        responses: {
          "200": {
            description: "User updated successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/User",
                },
              },
            },
          },
          "401": {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },

      // Delete User by ID route documentation
      delete: {
        tags: ["Users"],
        summary: "Delete user by ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", pattern: "mongooseValid" },
            description: "ID of the user to delete",
          },
        ],
        responses: {
          "200": {
            description: "User deleted successfully",
          },
          "404": {
            description: "User not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },

      // Patch User by ID route documentation
      patch: {
        tags: ["Users"],
        summary: "Patch user by ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "ID of the user to patch",
          },
        ],
        responses: {
          "200": {
            description: "User matched successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/User",
                },
              },
            },
          },
        },
      },
    },

    // Category routes
    "/categories": {
      get: {
        tags: ["Categories"],
        summary: "Get all categories",
        responses: {
          "200": {
            description: "A list of categories",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/Category",
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Categories"],
        summary: "Create a new category",
        requestBody: {
          description: "Category data",
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CategoryInput",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Category created successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Category",
                },
              },
            },
          },
          "400": {
            description: "Invalid category data",
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

    "categories/{id}": {
      // Get category by ID
      get: {
        tags: ["Categories"],
        summary: "Get category by ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Category details",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Category",
                },
              },
            },
          },
        },
      },

      // Update category by ID
      put: {
        tags: ["Categories"],
        summary: "Update category by ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Category",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Category updated successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Category",
                },
              },
            },
          },
          "404": {
            description: "Category not found",
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

      // Delete category by ID
      delete: {
        tags: ["Categories"],
        summary: "Delete category by ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "204": {
            description: "Category deleted successfully",
          },
          "404": {
            description: "Category not found",
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

    // Languages routes
    "/languages": {
      get: {
        tags: ["Languages"],
        summary: "Get all languages",
        responses: {
          "200": {
            description: "A list of languages",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/Language",
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Languages"],
        summary: "Create a new language",
        requestBody: {
          description: "Language data",
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/LanguageInput",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Language created successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Language",
                },
              },
            },
          },
          "400": {
            description: "Invalid language data",
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

    // Language by ID routes
    "languages/{id}": {
      // Get language by ID
      get: {
        tags: ["Languages"],
        summary: "Get language by ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Language details",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Language",
                },
              },
            },
          },
        },
      },

      // Update language by ID
      put: {
        tags: ["Languages"],
        summary: "Update language by ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Language",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Language updated successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Language",
                },
              },
            },
          },
          "404": {
            description: "Language not found",
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

      // Delete language by ID
      delete: {
        tags: ["Languages"],
        summary: "Delete language by ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "204": {
            description: "Language deleted successfully",
          },
          "404": {
            description: "Language not found",
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

    // Skills routes
    "/skills": {
      get: {
        tags: ["Skills"],
        summary: "Get all skills",
        responses: {
          "200": {
            description: "A list of skills",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/Skill",
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Skills"],
        summary: "Create a new skill",
        requestBody: {
          description: "Skill data",
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/SkillInput",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Skill created successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Skill",
                },
              },
            },
          },
          "400": {
            description: "Invalid skill data",
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

    // Skill by ID routes
    "skills/{id}": {
      // Get skill by ID
      get: {
        tags: ["Skills"],
        summary: "Get skill by ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Skill details",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Skill",
                },
              },
            },
          },
        },
      },

      // Update skill by ID
      put: {
        tags: ["Skills"],
        summary: "Update skill by ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Skill",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Skill updated successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Skill",
                },
              },
            },
          },
          "404": {
            description: "Skill not found",
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

      // Delete skill by ID
      delete: {
        tags: ["Skills"],
        summary: "Delete skill by ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "204": {
            description: "Skill deleted successfully",
          },
          "404": {
            description: "Skill not found",
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

    // Offer routes
    "/offers": {
      // Get all offers
      get: {
        tags: ["Offers"],
        summary: "Get all offers",
        responses: {
          "200": {
            description: "A list of offers",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/Offer",
                  },
                },
              },
            },
          },
        },
      },

      // Create a new offer
      post: {
        tags: ["Offers"],
        summary: "Create a new offer",
        security: [{ cookieAuth: [] }],
        requestBody: {
          description: "Offer data",
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/OfferInput",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Offer created successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Offer",
                },
              },
            },
          },
          "400": {
            description: "Invalid offer data",
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

    // My Offers routes
    "/myOffers": {
      get: {
        tags: ["Offers"],
        summary: "Get offers of the authenticated user",
        security: [{ cookieAuth: [] }],
        responses: {
          "200": {
            description: "A list of user offers",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/Offer",
                  },
                },
              },
            },
          },
        },
      },
    },

    // Offer by ID routes
    "/offers/{id}": {
      // Get offer by ID
      get: {
        tags: ["Offers"],
        summary: "Get offer by ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", pattern: "mongooseValid" },
          },
        ],
        responses: {
          "200": {
            description: "Offer details",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Offer",
                },
              },
            },
          },
          "404": {
            description: "Offer not found",
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

      // Accept offer. Create HelpSession by ID
      post: {
        tags: ["Offers"],
        summary: "Accept offer by ID",
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", pattern: "mongooseValid" },
          },
        ],
        responses: {
          "201": {
            description: "Offer accepted and Help Session created successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/HelpSession",
                },
              },
            },
          },
          "404": {
            description: "Offer not found",
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

      // Update offer by ID
      put: {
        tags: ["Offers"],
        summary: "Update offer by ID",
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", pattern: "mongooseValid" },
          },
        ],
        requestBody: {
          description: "Offer data to update",
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/OfferInput",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Offer updated successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Offer",
                },
              },
            },
          },
          "404": {
            description: "Offer not found",
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

      // Delete offer by ID
      delete: {
        tags: ["Offers"],
        summary: "Delete offer by ID",
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", pattern: "mongooseValid" },
          },
        ],
        responses: {
          "204": {
            description: "Offer deleted successfully",
          },
          "404": {
            description: "Offer not found",
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

    // Requests routes
    "/requests": {
      // Get all requests
      get: {
        tags: ["Requests"],
        summary: "Get all requests",
        responses: {
          "200": {
            description: "A list of requests",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/Request",
                  },
                },
              },
            },
          },
        },
      },

      // Create a new request
      post: {
        tags: ["Requests"],
        summary: "Create a new request",
        security: [{ cookieAuth: [] }],
        requestBody: {
          description: "Request data",
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/RequestInput",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Request created successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Request",
                },
              },
            },
          },
          "400": {
            description: "Invalid request data",
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

    // My Requests routes
    "/myRequests": {
      get: {
        tags: ["Requests"],
        summary: "Get requests of the authenticated user",
        security: [{ cookieAuth: [] }],
        responses: {
          "200": {
            description: "A list of user requests",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/Request",
                  },
                },
              },
            },
          },
        },
      },
    },

    // My Alerts routes
    "/myAlerts": {
      get: {
        tags: ["Alerts"],
        summary: "Get alerts of the authenticated user",
        security: [{ cookieAuth: [] }],
        responses: {
          "200": {
            description: "A list of user alerts",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/Request",
                  },
                },
              },
            },
          },
        },
      },
    },

    // Request by ID routes
    "/requests/{id}": {
      // Get request by ID
      get: {
        tags: ["Requests"],
        summary: "Get request by ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", pattern: "mongooseValid" },
          },
        ],
        responses: {
          "200": {
            description: "Request details",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Request",
                },
              },
            },
          },
          "404": {
            description: "Request not found",
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

      // Accept request. Create HelpSession by ID
      post: {
        tags: ["Requests"],
        summary: "Accept request by ID",
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", pattern: "mongooseValid" },
          },
        ],
        responses: {
          "201": {
            description:
              "Request accepted and Help Session created successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/HelpSession",
                },
              },
            },
          },
          "404": {
            description: "Request not found",
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

      // Update request by ID
      put: {
        tags: ["Requests"],
        summary: "Update request by ID",
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", pattern: "mongooseValid" },
          },
        ],
        requestBody: {
          description: "Request data to update",
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/RequestInput",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Request updated successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Request",
                },
              },
            },
          },
          "404": {
            description: "Request not found",
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

      // Delete request by ID
      delete: {
        tags: ["Requests"],
        summary: "Delete request by ID",
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", pattern: "mongooseValid" },
          },
        ],
        responses: {
          "204": {
            description: "Request deleted successfully",
          },
          "404": {
            description: "Request not found",
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

    // Help Sessions routes
    "/help-sessions": {
      get: {
        tags: ["HelpSessions"],
        summary: "Get all help sessions for the authenticated user",
        security: [{ cookieAuth: [] }],
        responses: {
          "200": {
            description: "A list of help sessions",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/HelpSession",
                  },
                },
              },
            },
          },
        },
      },
    },

    // Help Session by ID routes
    "/help-sessions/{id}": {
      put: {
        tags: ["HelpSessions"],
        summary: "Update help session status by ID",
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", pattern: "mongooseValid" },
            description: "ID of the help session to update",
          },
        ],
        requestBody: {
          description: "Help session status data",
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: {
                    type: "string",
                    enum: ["active", "completed", "cancelled"],
                  },
                },
                required: ["status"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Help session updated successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/HelpSession",
                },
              },
            },
          },
          "404": {
            description: "Help session not found",
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

    // Notifications routes
    "/notifications": {
      get: {
        tags: ["Notifications"],
        summary: "Get notifications for the authenticated user",
        security: [{ cookieAuth: [] }],
        responses: {
          "200": {
            description: "A list of notifications",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/Notification",
                  },
                },
              },
            },
          },
        },
      },
    },

    // Mark Notification as Read by ID route
    "/notifications/{id}/read": {
      patch: {
        tags: ["Notifications"],
        summary: "Mark notification as read by ID",
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", pattern: "mongooseValid" },
            description: "ID of the notification to mark as read",
          },
        ],
        responses: {
          "200": {
            description: "Notification marked as read successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Notification",
                },
              },
            },
          },
          "404": {
            description: "Notification not found",
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

    // Mark All Notifications as Read route
    "/notifications/readAll": {
      patch: {
        tags: ["Notifications"],
        summary: "Mark all notifications as read for the authenticated user",
        security: [{ cookieAuth: [] }],
        responses: {
          "200": {
            description: "All notifications marked as read successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },

    // Delete Notification by ID route
    "/notifications/{id}": {
      delete: {
        tags: ["Notifications"],
        summary: "Delete notification by ID",
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", pattern: "mongooseValid" },
            description: "ID of the notification to delete",
          },
        ],
        responses: {
          "204": {
            description: "Notification deleted successfully",
          },
          "404": {
            description: "Notification not found",
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

    // Delete All Notifications route
    "/notifications/deleteAll": {
      delete: {
        tags: ["Notifications"],
        summary: "Delete all notifications for the authenticated user",
        security: [{ cookieAuth: [] }],
        responses: {
          "204": {
            description: "All notifications deleted successfully",
          },
        },
      },
    },

    // Chat routes
    "/chat/{sessionId}": {
      post: {
        tags: ["Chat"],
        summary: "Send a chat message in a help session",
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "sessionId",
            in: "path",
            required: true,
            schema: { type: "string", pattern: "mongooseValid" },
            description: "ID of the help session",
          },
        ],
        requestBody: {
          description: "Chat message data",
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: { type: "string", minLength: 1, maxLength: 1000 },
                },
                required: ["message"],
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Chat message sent successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ChatMessage",
                },
              },
            },
          },
          "400": {
            description: "Invalid chat message data",
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

      get: {
        tags: ["Chat"],
        summary: "Get chat messages for a help session",
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "sessionId",
            in: "path",
            required: true,
            schema: { type: "string", pattern: "mongooseValid" },
            description: "ID of the help session",
          },
        ],
        responses: {
          "200": {
            description: "A list of chat messages",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/ChatMessage",
                  },
                },
              },
            },
          },
        },
      },
    },

    // Update One Message of Chat Message by ID route
    "/chat/{id}": {
      put: {
        tags: ["Chat"],
        summary: "Update a chat message by ID",
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", pattern: "mongooseValid" },
            description: "ID of the chat message to update",
          },
        ],
        requestBody: {
          description: "Updated chat message data",
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: { type: "string", minLength: 1, maxLength: 1000 },
                },
                required: ["message"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Chat message marked as read successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ChatMessage",
                },
              },
            },
          },
          "404": {
            description: "Chat message not found",
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

    // Mark One Message of Chat Message as Read by ID route
    "/chat/{id}/read": {
      patch: {
        tags: ["Chat"],
        summary: "Mark one message of chat message as read by ID",
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", pattern: "mongooseValid" },
            description: "ID of the one message of the chat to mark as read",
          },
        ],
        responses: {
          "200": {
            description: "One message of chat marked as read successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ChatMessage",
                },
              },
            },
          },
          "404": {
            description: "Chat message not found",
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

    // Mark All Messages of Chat as Read route
    "/chat/{sessionId}/readAll": {
      patch: {
        tags: ["Chat"],
        summary: "Mark all chat messages as read in a help session",
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "sessionId",
            in: "path",
            required: true,
            schema: { type: "string", pattern: "mongooseValid" },
            description: "ID of the help session",
          },
        ],
        responses: {
          "200": {
            description: "All chat messages marked as read successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                  },
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

      AuthLoginInput: {
        type: "object",
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string", format: "password", minLength: 6 },
        },
        required: ["email", "password"],
      },

      AuthRegisterInput: {
        type: "object",
        properties: {
          firstName: { type: "string", minLength: 2, maxLength: 100 },
          lastName: { type: "string", minLength: 2, maxLength: 100 },
          email: { type: "string", format: "email" },
          password: { type: "string", format: "password", minLength: 6 },
          phone: { type: "string", minLength: 10, maxLength: 15 },
          bio: { type: "string", maxLength: 500 },
          skills: { type: "array", items: { type: "string" } },
          languages: { type: "array", items: { type: "string" } },
          location: { type: "string", minLength: 2, maxLength: 100 },
          longitude: { type: "number", minimum: -180, maximum: 180 },
          latitude: { type: "number", minimum: -90, maximum: 90 },
        },
        required: [
          "firstName",
          "lastName",
          "email",
          "password",
          "phone",
          "location",
          "longitude",
          "latitude",
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
          profileImage: { type: "string", format: "uri" },
          bio: { type: "string" },
          skills: { type: "array", items: { type: "string" } },
          languages: { type: "array", items: { type: "string" } },
          location: { type: "string" },
          rating: { type: "number", minimum: 0, maximum: 5 },
          createdAt: { type: "string", format: "date-time" },
        },
      },

      UserInput: {
        type: "object",
        required: [
          "firstName",
          "lastName",
          "email",
          "phone",
          "location",
          "longitude",
          "latitude",
        ],
        properties: {
          firstName: { type: "string", minLength: 2, maxLength: 100 },
          lastName: { type: "string", minLength: 2, maxLength: 100 },
          email: { type: "string", format: "email" },
          phone: { type: "string" },
          bio: { type: "string", maxLength: 500 },
          skills: { type: "array", items: { type: "string" } },
          languages: { type: "array", items: { type: "string" } },
          location: { type: "string", minLength: 2, maxLength: 100 },
          longitude: { type: "number", minimum: -180, maximum: 180 },
          latitude: { type: "number", minimum: -90, maximum: 90 },
        },
      },

      Offer: {
        type: "object",
        properties: {
          id: { type: "string", pattern: "mongooseValid" },
          userId: { type: "string", pattern: "mongooseValid" },
          title: { type: "string", minLength: 5, maxLength: 100 },
          description: { type: "string", minLength: 10, maxLength: 1000 },
          categoryId: { type: "string", pattern: "mongooseValid" },
          isPaid: { type: "boolean" },
          price: { type: "number", minimum: 0 },
          location: { type: "string" },
          longitude: { type: "number", minimum: -180, maximum: 180 },
          latitude: { type: "number", minimum: -90, maximum: 90 },
          images: { type: "array", items: { type: "string", format: "uri" } },
          status: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
        },
        required: [
          "userId",
          "title",
          "description",
          "categoryId",
          "location",
          "longitude",
          "latitude",
        ],
      },

      OfferInput: {
        type: "object",
        required: ["userId", "title", "description", "categoryId"],
        properties: {
          title: { type: "string", minLength: 5, maxLength: 100 },
          description: { type: "string", minLength: 10, maxLength: 1000 },
          categoryId: { type: "string", pattern: "mongooseValid" },
          isPaid: { type: "boolean" },
          price: { type: "number", minimum: 0 },
          location: { type: "string", minLength: 2, maxLength: 100 },
          longitude: { type: "number", minimum: -180, maximum: 180 },
          latitude: { type: "number", minimum: -90, maximum: 90 },
          images: { type: "array", items: { type: "string", format: "uri" } },
        },
      },

      Request: {
        oneOf: [
          {
            type: "object",
            properties: {
              id: { type: "string", pattern: "mongooseValid" },
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
              urgency: { type: "string" },
              images: {
                type: "array",
                items: { type: "string", format: "uri" },
              },
              status: { type: "string" },
              createdAt: { type: "string", format: "date-time" },
            },
            required: [
              "userId",
              "title",
              "description",
              "typeRequest",
              "categoryId",
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
              urgency: { type: "string" },
              radius: { type: "number", minimum: 0 },
              images: {
                type: "array",
                items: { type: "string", format: "uri" },
              },
              status: { type: "string" },
              createdAt: { type: "string", format: "date-time" },
            },
            required: ["userId", "typeRequest", "categoryId"],
          },
        ],
      },

      RequestInput: {
        oneOf: [
          {
            type: "object",
            required: ["title", "description", "typeRequest", "categoryId"],
            properties: {
              title: { type: "string", minLength: 5, maxLength: 100 },
              description: { type: "string", minLength: 10, maxLength: 1000 },
              typeRequest: { type: "string", enum: ["request"] },
              categoryId: { type: "string", pattern: "mongooseValid" },
              location: { type: "string", minLength: 2, maxLength: 100 },
              longitude: { type: "number", minimum: -180, maximum: 180 },
              latitude: { type: "number", minimum: -90, maximum: 90 },
              rewardType: { type: "string", enum: ["free", "paid"] },
              price: { type: "number", minimum: 0 },
              urgency: { type: "string" },
              images: {
                type: "array",
                items: { type: "string", format: "uri" },
              },
            },
          },
          {
            type: "object",
            required: ["typeRequest", "categoryId"],
            properties: {
              title: { type: "string", minLength: 5, maxLength: 100 },
              description: { type: "string", minLength: 10, maxLength: 1000 },
              typeRequest: { type: "string", enum: ["alert"] },
              categoryId: { type: "string", pattern: "mongooseValid" },
              location: { type: "string", minLength: 2, maxLength: 100 },
              longitude: { type: "number", minimum: -180, maximum: 180 },
              latitude: { type: "number", minimum: -90, maximum: 90 },
              urgency: { type: "string" },
              radius: { type: "number", minimum: 0 },
              images: {
                type: "array",
                items: { type: "string", format: "uri" },
              },
            },
          },
        ],
      },

      HelpSession: {
        oneOf: [
          {
            type: "object",
            required: [
              "helperId",
              "userRequesterId",
              "userHelperId",
              "status",
              "startedAt",
            ],
            properties: {
              id: { type: "string", pattern: "mongooseValid" },
              offerId: { type: "string", pattern: "mongooseValid" },
              requestId: { type: "string", pattern: "mongooseValid" },
              userRequesterId: { type: "string", pattern: "mongooseValid" },
              userHelperId: { type: "string", pattern: "mongooseValid" },
              status: { type: "string" },
              result: { type: "string" },
              ratingPending: { type: "boolean" },
              rating: { type: "number", minimum: 0, maximum: 5 },
              notes: { type: "string" },
              finalizedBy: { type: "string" },
              startedAt: { type: "string", format: "date-time" },
              endedAt: { type: "string", format: "date-time" },
            },
          },
          {
            type: "object",
            required: [
              "requesterId",
              "userRequesterId",
              "userHelperId",
              "status",
              "startedAt",
            ],
            properties: {
              id: { type: "string", pattern: "mongooseValid" },
              offerId: { type: "string", pattern: "mongooseValid" },
              requestId: { type: "string", pattern: "mongooseValid" },
              userRequesterId: { type: "string", pattern: "mongooseValid" },
              userHelperId: { type: "string", pattern: "mongooseValid" },
              status: { type: "string" },
              result: { type: "string" },
              ratingPending: { type: "boolean" },
              rating: { type: "number", minimum: 0, maximum: 5 },
              notes: { type: "string" },
              finalizedBy: { type: "string" },
              startedAt: { type: "string", format: "date-time" },
              endedAt: { type: "string", format: "date-time" },
            },
          },
        ],
      },

      HelpSessionInput: {
        type: "object",
        required: ["status"],
        properties: {
          status: {
            type: "string",
            enum: ["active", "completed", "cancelled"],
          },
          result: {
            type: "string",
            enum: ["successful", "unsuccessful", "partial", "undefined"],
          },
          ratingPending: { type: "boolean" },
          rating: { type: "number", minimum: 0, maximum: 5 },
          notes: { type: "string", maxLength: 2000 },
          finalizedBy: {
            type: "string",
            enum: ["requester", "helper", "system", "none"],
          },
          endetAt: { type: "string", format: "date-time" },
        },
      },

      Notification: {
        type: "object",
        properties: {
          id: { type: "string", pattern: "mongooseValid" },
          userId: { type: "string", pattern: "mongooseValid" },
          resourceModel: { type: "string" },
          resourceId: { type: "string", pattern: "mongooseValid" },
          title: { type: "string" },
          message: { type: "string" },
          type: { type: "string" },
          status: { type: "string" },
          isRead: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
        },
        required: ["userId", "message", "type"],
      },

      NotificationInput: {
        type: "object",
        required: ["userId", "message", "type"],
        properties: {
          userId: { type: "string", pattern: "mongooseValid" },
          resourceModel: { type: "string" },
          resourceId: { type: "string", pattern: "mongooseValid" },
          title: { type: "string" },
          message: { type: "string" },
          type: { type: "string" },
          status: { type: "string" },
          isRead: { type: "boolean" },
        },
      },

      ChatMessage: {
        type: "object",
        properties: {
          id: { type: "string", pattern: "mongooseValid" },
          sessionId: { type: "string", pattern: "mongooseValid" },
          senderId: { type: "string", pattern: "mongooseValid" },
          receiverId: { type: "string", pattern: "mongooseValid" },
          content: { type: "string" },
          attachements: {
            type: "array",
            items: { type: "string", format: "uri" },
          },
          notifId: { type: "string", pattern: "mongooseValid" },
          isRead: { type: "boolean" },
          edited: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
        },
        required: ["sessionId", "senderId", "receiverId", "content"],
      },

      ChatMessageInput: {
        type: "object",
        required: ["sessionId", "senderId", "receiverId", "content"],
        properties: {
          sessionId: { type: "string", pattern: "mongooseValid" },
          senderId: { type: "string", pattern: "mongooseValid" },
          receiverId: { type: "string", pattern: "mongooseValid" },
          content: { type: "string" },
          attachements: {
            type: "array",
            items: { type: "string", format: "uri" },
          },
        },
      },

      Language: {
        type: "object",
        required: ["en"],
        properties: {
          id: { type: "string", pattern: "mongooseValid" },
          en: { type: "string" },
          de: { type: "string" },
          fr: { type: "string" },
        },
      },

      LanguageInput: {
        type: "object",
        required: ["en"],
        properties: {
          en: { type: "string" },
          de: { type: "string" },
          fr: { type: "string" },
        },
      },

      Skill: {
        type: "object",
        required: ["en"],
        properties: {
          id: { type: "string", pattern: "mongooseValid" },
          en: { type: "string" },
          de: { type: "string" },
          fr: { type: "string" },
        },
      },

      SkillInput: {
        type: "object",
        required: ["en"],
        properties: {
          en: { type: "string" },
          de: { type: "string" },
          fr: { type: "string" },
        },
      },

      Category: {
        type: "object",
        required: ["name"],
        properties: {
          id: { type: "string", pattern: "mongooseValid" },
          name: { type: "string" },
          description: { type: "string" },
          color: { type: "string" },
          icon: { type: "string", format: "uri" },
        },
      },

      CategoryInput: {
        type: "object",
        required: ["name"],
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          color: { type: "string" },
          icon: { type: "string", format: "uri" },
        },
      },
    },
  },
};
