import openapi from "@elysiajs/openapi";
import Elysia from "elysia";
import { PrismaClient } from "./prisma/client";
import { jwtHandle } from "./plugins/jwt-app";

export const prisma = new PrismaClient();

/** Tag của các nhóm API bị ẩn khỏi Swagger. */
export const HIDDEN_FILE_TAG = "File Management";
export const HIDDEN_DB_TAG = "Database";

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
      // Favicon của trang Swagger (Scalar) dùng chung icon với frontend (`frontend/public/assets/icon.png`).
      // Dev: Vite (3039) phục vụ /assets; production: backend phục vụ /assets từ public/.
      scalar: {
        favicon: "/assets/icon.png",
      } as Record<string, unknown>,
      // File Management và Database vẫn chạy (frontend dùng API file để upload ảnh sách)
      // nhưng ẩn khỏi Swagger theo yêu cầu (2026-11-20), giống trang File / Database đã ẩn trên UI.
      exclude: {
        tags: [HIDDEN_FILE_TAG, HIDDEN_DB_TAG],
      },
      documentation: {
        openapi: "3.0.0",
        info: {
          title: "AnhTester Book Management API",
          description:
            "A comprehensive API for managing books, users, categories, promotions, and addresses, provided by [AnhTester](https://anhtester.com). The API is designed to be easy to use and supports a wide range of operations for book management, user management, category management, promotion management, and address management. \
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
            name: "Order Management",
            description:
              "Checkout: quote a list of books (no login), place an order, list / view / cancel your own orders. " +
              "Prices are always computed by the server from the books' current selling price; shipping is free over 500,000 VND " +
              "or when a book has a FREE_SHIPPING promotion in effect, otherwise 30,000 VND."
          },
          {
            name: "Cart Management",
            description:
              "Server-side shopping cart of the signed-in user (one line per book, 1 – 99 copies, at most 50 books). " +
              "Reading the cart always returns current prices and totals (same rules as POST /api/order/quote). " +
              "Guests keep their cart in the browser and merge it with POST /api/cart/merge after signing in. " +
              "Placing an order removes the ordered books from the cart."
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
