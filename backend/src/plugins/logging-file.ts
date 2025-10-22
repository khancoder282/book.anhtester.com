import path from "path"
import fs from "fs"
import dayjs from "dayjs"

const pathlogging = path.join(process.cwd(), "logs")

if (!fs.existsSync(pathlogging)) {
    fs.mkdirSync(pathlogging)
}

export default {
    log: (message: string) => {
        fs.appendFileSync(path.join(pathlogging, `${dayjs().format("YYYY-MM-DD")}-log.txt`),
        `[${dayjs().format("YYYY/MM/DD -HH:mm:ss")}] - ${message}\n`
    )
    }
}