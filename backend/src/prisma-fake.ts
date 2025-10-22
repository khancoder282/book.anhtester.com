import { faker } from "@faker-js/faker";
import { $Enums, PrismaClient } from "./prisma/client";

const prisma = new PrismaClient()

async function main() {
    let count = 1;
    await prisma.book.deleteMany();
    const categories = await prisma.category.findMany();
    while (true) {
        try{
            const name = faker.book.title() + Bun.randomUUIDv7();
            const price = faker.number.int({min: 10_000, max: 10_000_000})
            await prisma.book.create({
                data: {
                    categories: {
                        connect: Array.from({length: Math.floor(Math.random() * 5)}, (_, i)=>categories[Math.floor(Math.random() * categories.length)])
                    },
                    name: faker.book.title() + " " + count,
                    slug: name.replaceAll(/\s/g, "-") + "-" + count,
                    description: faker.lorem.sentence({max: 250, min: 50}),
                    price: price,
                    currentPrice: price,
                    status: $Enums.BookStatus.AVAILABLE,
                    picture: Array.from({length: 10}, (_, i)=>`cover-${i+i}.webp`).sort(() => Math.random() - 0.5).join(","),
                    authId: (await prisma.user.findFirst())?.id
                }
            })
            count+=1;
            console.log("Success")
        }catch(err){
            // console.log(err)
            
        }
    }
}

main();

