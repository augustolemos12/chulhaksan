const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const groups = await prisma.classGroup.findMany({ include: { teacher: true, gym: true } });
  console.log('ClassGroups count:', groups.length);
  console.dir(groups, { depth: null });
}

main().catch(console.error).finally(() => prisma.$disconnect());
