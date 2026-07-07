import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      }
    });
    console.log("USERS IN DB:", JSON.stringify(users, null, 2));
  } catch (error) {
    console.error("PRISMA CONNECTION ERROR:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
