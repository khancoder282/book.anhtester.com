import Elysia from "elysia";
import { AppMain } from "../regis";

export default (new Elysia({
    detail: {
        hide: true
    },
    prefix: "db"
}) as unknown as AppMain)
    .get("/table", async ({ prisma }) => {
        const tables = await prisma.$queryRawUnsafe<
            { table_name: string }[]
        >("SHOW TABLES");
        return tables.map((row) => Object.values(row)[0]);
    })