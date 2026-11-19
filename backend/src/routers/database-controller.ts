import Elysia, { t } from "elysia";
import { AppMain } from "../regis";
import { auth } from "../plugins/auth";

type ColumnRow = {
    tableName: string;
    columnName: string;
    columnType: string;
    isNullable: string;
    columnKey: string;
    columnDefault: string | null;
    extra: string;
};

type ForeignKeyRow = {
    tableName: string;
    columnName: string;
    refTable: string;
    refColumn: string;
};

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
    .use(auth)
    // Chỉ trả cấu trúc bảng (cột, khoá, quan hệ) và số dòng, KHÔNG trả dữ liệu từng dòng
    // để không lộ hash mật khẩu, refresh token...
    .get("/schema", async ({ prisma }) => {
        const columns = await prisma.$queryRawUnsafe<ColumnRow[]>(
            `SELECT TABLE_NAME AS tableName, COLUMN_NAME AS columnName, COLUMN_TYPE AS columnType,
                    IS_NULLABLE AS isNullable, COLUMN_KEY AS columnKey,
                    COLUMN_DEFAULT AS columnDefault, EXTRA AS extra
             FROM information_schema.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE()
             ORDER BY TABLE_NAME, ORDINAL_POSITION`
        );
        const foreignKeys = await prisma.$queryRawUnsafe<ForeignKeyRow[]>(
            `SELECT TABLE_NAME AS tableName, COLUMN_NAME AS columnName,
                    REFERENCED_TABLE_NAME AS refTable, REFERENCED_COLUMN_NAME AS refColumn
             FROM information_schema.KEY_COLUMN_USAGE
             WHERE TABLE_SCHEMA = DATABASE() AND REFERENCED_TABLE_NAME IS NOT NULL`
        );

        const tableNames = [...new Set(columns.map((c) => c.tableName))];
        const counts = await Promise.all(
            tableNames.map(async (name) => {
                // Tên bảng lấy từ information_schema, escape dấu ` cho chắc
                const [row] = await prisma.$queryRawUnsafe<{ total: bigint }[]>(
                    `SELECT COUNT(*) AS total FROM \`${name.replace(/`/g, "``")}\``
                );
                return Number(row?.total ?? 0);
            })
        );

        return tableNames.map((name, i) => ({
            name,
            rows: counts[i],
            columns: columns
                .filter((c) => c.tableName === name)
                .map((c) => {
                    const fk = foreignKeys.find(
                        (f) => f.tableName === name && f.columnName === c.columnName
                    );
                    return {
                        name: c.columnName,
                        type: c.columnType,
                        nullable: c.isNullable === "YES",
                        key: c.columnKey,
                        default: c.columnDefault,
                        extra: c.extra,
                        references: fk ? `${fk.refTable}.${fk.refColumn}` : null,
                    };
                }),
        }));
    }, {
        response: {
            200: t.Array(t.Object({
                name: t.String({ description: "Tên bảng" }),
                rows: t.Number({ description: "Số dòng (COUNT(*))" }),
                columns: t.Array(t.Object({
                    name: t.String(),
                    type: t.String({ description: "Kiểu MySQL, VD varchar(191)" }),
                    nullable: t.Boolean(),
                    key: t.String({ description: "PRI | UNI | MUL | rỗng" }),
                    default: t.Nullable(t.String()),
                    extra: t.String({ description: "VD auto_increment" }),
                    references: t.Nullable(t.String({ description: "Khoá ngoại dạng bảng.cột" })),
                })),
            })),
        },
        detail: {
            hide: false,
            tags: ["Database"],
            description:
                "Get database structure: every table with its row count, columns, keys and foreign keys. Row data is never returned.",
        },
    })
