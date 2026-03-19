const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Testing connection with adapter...");
  const users = await prisma.user.findMany();
  console.log("Users API ok, found:", users.length);
}

main().catch(console.error).finally(() => prisma.$disconnect());
