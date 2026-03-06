import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const email    = process.env.ADMIN_EMAIL    || 'admin@techlab.com';
  const password = process.env.ADMIN_PASSWORD || 'admin123';

  const existing = await prisma.admin.findUnique({ where: { email } });

  if (!existing) {
    const hash = bcrypt.hashSync(password, 12);
    await prisma.admin.create({ data: { email, passwordHash: hash } });
    console.log(`✅ Admin criado: ${email}`);
  } else {
    console.log(`ℹ️  Admin já existe: ${email}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
