import openapi from "@elysiajs/openapi";
import Elysia from "elysia";
import { PrismaClient } from "./prisma/client";
import { jwtHandle } from "./plugins/jwt-app";

const prisma = new PrismaClient();

// Server đầu tiên trong danh sách là server mặc định của Swagger (Scalar).
// Chạy `bun run dev` thì để localhost lên đầu: trang Swagger local mà gọi sang production
// sẽ bị trình duyệt chặn CORS ("Failed to fetch"). Production (`bun run start`) giữ production lên đầu.
// Không dùng URL tương đối ("/" ra `//api/...` bị 404, "" làm code mẫu mất host).
const productionServer = { url: "https://book.anhtester.com", description: "Production Server" };
const localServer = {
  url: `http://localhost:${Bun.env.PORT ?? 4566}`,
  description: "Local development server"
};
const isDevRun = Bun.env.npm_lifecycle_event === "dev";
const swaggerServers = isDevRun ? [localServer, productionServer] : [productionServer, localServer];

export const regis = new Elysia()
  .use(
    openapi({
      path: "/swagger",
      documentation: {
        openapi: "3.0.0",
        info: {
          title: "AnhTester Book Management API",
          description:
            "A comprehensive API for managing books, users, files, categories, and addresses, provided by [AnhTester](https://anhtester.com). The API is designed to be easy to use and supports a wide range of operations for book management, user management, file management, category management, and address management. \
            UI page to run this API: [book.anhtester.com](https://book.anhtester.com)",
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
          },
          {
            name: "Database",
            description: "Read-only view of the database structure (tables, columns, keys, row counts)."
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
        servers: swaggerServers
      },
    })
  )
  .decorate("prisma", prisma)
  .decorate("auth", null as Auth | null)
  .decorate("storeMemory", new Map())
  .use(jwtHandle);

export type AppMain = typeof regis;
