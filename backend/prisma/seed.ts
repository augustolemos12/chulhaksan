import { PrismaClient, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL as string }),
});

async function main() {
  const adminDni = '44404990'; // o el DNI que corresponda
  const existingAdmin = await prisma.user.findUnique({ where: { dni: adminDni } });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('30082019', 10);
    const user = await prisma.user.create({
      data: {
        dni: adminDni,
        password: hashedPassword,
        role: Role.ADMIN,
        mustChangePassword: true,
      },
    });
    console.log(`✅ Admin creado con DNI: ${user.dni}`);
  } else {
    console.log('⚠️ El usuario admin ya existe.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
