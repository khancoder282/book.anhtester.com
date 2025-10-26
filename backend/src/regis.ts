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
          title: "API Quản lý Sách",
          description:
            "API toàn diện để quản lý sách, người dùng, tệp, danh mục và địa chỉ, được cung cấp bởi AnhTester[](https://anhtester.com).",
          version: "1.0.0",
          contact: {
            name: "Hỗ trợ AnhTester",
            url: "https://anhtester.com",
            email: "thaian.it15@gmail.com"
          },
        },
        tags: [
          {
            name: "Quản lý Xác thực",
            description:
              "Quản lý đăng nhập người dùng, bao gồm tạo và làm mới JWT token."
          },
          {
            name: "Quản lý Người dùng",
            description:
              "Quản lý tài khoản người dùng, bao gồm tạo, cập nhật và xóa thông tin người dùng."
          },
          {
            name: "Quản lý Tệp",
            description:
              "Hỗ trợ các thao tác với tệp như tải lên, tải xuống và quản lý tệp."
          },
          {
            name: "Quản lý Sách",
            description:
              "Quản lý thông tin sách, bao gồm tạo, cập nhật và truy xuất danh sách sách."
          },
          {
            name: "Quản lý Danh mục",
            description:
              "Quản lý danh mục sách, bao gồm tạo và cập nhật danh sách danh mục."
          },
          {
            name: "Quản lý Địa chỉ",
            description:
              "Quản lý thông tin địa chỉ tại Việt Nam, bao gồm tạo, truy xuất và cập nhật."
          },
          {
            name: "Quản lý giảm giá sản",
            description: "Quản lý giảm giá sản phẩm, cập nhật thông tin và cho biết nội dung của giảm giá"
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
            description: "Máy chủ sản xuất"
          }
        ]
      }
    })
  )
  .decorate("prisma", prisma)
  .decorate("auth", null as Auth | null)
  .decorate("storeMemory", new Map())
  .use(jwtHandle);

export type AppMain = typeof regis;
