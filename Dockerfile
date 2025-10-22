# 1. Base image from Bun
FROM oven/bun:1@sha256:420d7f4b99caadf1727ced361ae9455fbd175d54e3ec7ed698901fbf67cb2b1f

WORKDIR /app

COPY package.json bun.lock /app/

RUN bun install

COPY . .

RUN bunx prisma generate
RUN bun run build

RUN rm -rf node_modules
RUN rm -rf bun.lockb
RUN rm -rf prisma
RUN rm -rf README.md

RUN bun install --production

EXPOSE 3000

CMD ["bun", "run", "start"]