import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clear old data
  await prisma.foundMarker.deleteMany();
  await prisma.game.deleteMany();
  await prisma.character.deleteMany();
  await prisma.image.deleteMany();

  // Create one test image
  const image = await prisma.image.create({
    data: {
      slug: "waldo-test",              // ✅ added slug (must be unique)
      title: "Test Waldo Image",
      filename: "waldo1.jpg",          // make sure this exists in frontend/public/assets/
      width: 1920,
      height: 1080,
      characters: {
        create: [
          {
            name: "Waldo",
            x: 0.35,
            y: 0.65,
            radius: 0.05,
          },
          {
            name: "Wizard",
            x: 0.7,
            y: 0.4,
            radius: 0.05,
          },
          {
            name: "Odlaw",
            x: 0.15,
            y: 0.2,
            radius: 0.05,
          },
        ],
      },
    },
    include: { characters: true },
  });

  console.log("✅ Seeded image with characters:", image);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
