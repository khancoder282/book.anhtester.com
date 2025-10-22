import openapi from "@elysiajs/openapi";
import Elysia from "elysia";
import { PrismaClient } from "./prisma/client";
import { jwtHandle } from "./plugins/jwt-app";

const prisma = new PrismaClient();


export const regis = new Elysia()
  .use(
    openapi({
      path: "swagger",
      documentation: {
        openapi: "3.0.0",
        tags: [
          {
            name: "Auth management",
            description:
              "Quản lý cơ chế đăng nhập với jwt token, hỗ trợ refetch token",
          },
          {
            name: "User management",
            description:
              "Quản lý danh sách người dùng, quản lý tài khoản người dùng",
          },
          {
            name: "File management",
            description: "Quản lý tập tin, upload, download",
          },
          {
            name: "Book management",
            description: "Quản lý danh sách quản lý",
          },
          {
            name: "Category management",
            description: "Quản lý danh sách danh mục",
          },
        ],
        info: {
          title: "Book management API",
          description:
            "This is a book management API free by https://anhtester.com",
          version: "1.0.0",
        },
        components: {
          securitySchemes: {
            bearerAuth: {
              type: "http",
              scheme: "bearer",
              bearerFormat: "JWT",
            },
          },
        },
        security: [
          {
            bearerAuth: [],
          },
        ],
      },
    })
  )
  .decorate("prisma", prisma)
  .decorate("auth", null as Auth | null)
  .decorate("storeMemory", new Map())
  .use(jwtHandle);

export type AppMain = typeof regis;
