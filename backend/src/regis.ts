import openapi from "@elysiajs/openapi";
import Elysia from "elysia";
import { PrismaClient } from "./prisma/client";
import { jwtHandle } from "./plugins/jwt-app";

const prisma = new PrismaClient();


export const regis = new Elysia()
  .use(
    openapi({
      path: "/swagger",
      documentation: {
        openapi: "3.0.0",
        info: {
          title: "AnhTester Book Management API",
          description:
            "A comprehensive API for managing books, users, files, categories, and addresses, provided by AnhTester[](https://anhtester.com).",
          version: "1.0.0",
          contact: {
            name: "AnhTester Support",
            url: "https://anhtester.com",
            email: "thaian.it15@gmail.com"
          },
          
          
        },
        tags: [
          {
            name: "Authentication Management",
            description:
              "Manage user authentication, including creation and refresh of JWT tokens."
          },
          {
            name: "User Management",
            description:
              "Manage user accounts, including creating, updating, and deleting user information."
          },
          {
            name: "File Management",
            description:
              "Support file operations such as upload, download, and file management."
          },
          {
            name: "Book Management",
            description:
              "Manage book information, including creating, updating, and retrieving book lists."
          },
          {
            name: "Category Management",
            description:
              "Manage book categories, including creating and updating category lists."
          },
          {
            name: "Address Management",
            description:
              "Manage address information in Vietnam, including creation, retrieval, and updates."
          },
          {
            name: "Promotion Management",
            description: "Manage promotions, update information, and provide promotion details."
          }
        ],
        components: {
          securitySchemes: {
            BearerAuth: {
              type: "http",
              scheme: "bearer",
              bearerFormat: "JWT"
            }
          }
        },
        security: [
          {
            BearerAuth: []
          }
        ],
        servers: [
          {
            url: "https://book.anhtester.com",
            description: "Production Server"
          }
        ]
      },
    })
  )
  .decorate("prisma", prisma)
  .decorate("auth", null as Auth | null)
  .decorate("storeMemory", new Map())
  .use(jwtHandle);

export type AppMain = typeof regis;
