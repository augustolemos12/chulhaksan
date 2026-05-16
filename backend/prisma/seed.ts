import { PrismaClient, Role, StudentCategory, Belt, DayOfWeek } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Clean existing data
  console.log('🧹 Cleaning existing data...');
  await prisma.attendance.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.fee.deleteMany();
  await prisma.studentFormAccess.deleteMany();
  await prisma.studentBelt.deleteMany();
  await prisma.student.deleteMany();
  await prisma.classPlan.deleteMany();
  await prisma.classGroup.deleteMany();
  await prisma.gym.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.user.deleteMany();

  const defaultPassword = await bcrypt.hash('123456', 10);

  // 2. Create Admin
  console.log('👑 Creating Admin...');
  await prisma.user.create({
    data: {
      dni: 'admin123',
      password: defaultPassword,
      role: Role.ADMIN,
      mustChangePassword: false,
    },
  });

  // 3. Create Teachers
  console.log('👨‍🏫 Creating Teachers...');
  const teacherUser1 = await prisma.user.create({
    data: {
      dni: 'teacher1',
      password: defaultPassword,
      role: Role.TEACHER,
      mustChangePassword: false,
      teacher: {
        create: {
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juan@chulhaksan.com',
          phone: '1234567890',
        },
      },
    },
    include: { teacher: true },
  });

  const teacherUser2 = await prisma.user.create({
    data: {
      dni: 'teacher2',
      password: defaultPassword,
      role: Role.TEACHER,
      mustChangePassword: false,
      teacher: {
        create: {
          firstName: 'María',
          lastName: 'Gómez',
          email: 'maria@chulhaksan.com',
          phone: '0987654321',
        },
      },
    },
    include: { teacher: true },
  });

  const teacher1 = teacherUser1.teacher!;
  const teacher2 = teacherUser2.teacher!;

  // 4. Create Gyms
  console.log('🏢 Creating Gyms...');
  const gym1 = await prisma.gym.create({
    data: {
      name: 'Sede Central',
      isActive: true,
    },
  });

  const gym2 = await prisma.gym.create({
    data: {
      name: 'Sede Norte',
      isActive: true,
    },
  });


  // 5. Create ClassGroups
  console.log('👥 Creating ClassGroups...');
  const classGroup1 = await prisma.classGroup.create({
    data: {
      teacherId: teacher1.id,
      gymId: gym1.id,
      name: 'Adultos Martes/Jueves',
      category: StudentCategory.ADULT,
      daysOfWeek: [DayOfWeek.TUESDAY, DayOfWeek.THURSDAY],
      startTime: '19:00',
      endTime: '20:30',
      isActive: true,
    }
  });

  const classGroup2 = await prisma.classGroup.create({
    data: {
      teacherId: teacher1.id,
      gymId: gym1.id,
      name: 'Infantiles Martes/Jueves',
      category: StudentCategory.CHILD,
      daysOfWeek: [DayOfWeek.TUESDAY, DayOfWeek.THURSDAY],
      startTime: '17:00',
      endTime: '18:30',
      isActive: true,
    }
  });

  const classGroup3 = await prisma.classGroup.create({
    data: {
      teacherId: teacher2.id,
      gymId: gym2.id,
      name: 'Adultos Lunes/Miercoles',
      category: StudentCategory.ADULT,
      daysOfWeek: [DayOfWeek.MONDAY, DayOfWeek.WEDNESDAY],
      startTime: '20:00',
      endTime: '21:30',
      isActive: true,
    }
  });

  const classGroup4 = await prisma.classGroup.create({
    data: {
      teacherId: teacher2.id,
      gymId: gym2.id,
      name: 'Infantiles Lunes/Miercoles',
      category: StudentCategory.CHILD,
      daysOfWeek: [DayOfWeek.MONDAY, DayOfWeek.WEDNESDAY],
      startTime: '18:00',
      endTime: '19:30',
      isActive: true,
    }
  });


  // 6. Create Students
  console.log('🥋 Creating Students...');
  const studentData = [
    { dni: 'student1', firstName: 'Carlos', lastName: 'López', category: StudentCategory.ADULT, gymId: gym1.id, teacherId: teacher1.id, classGroupId: classGroup1.id },
    { dni: 'student2', firstName: 'Ana', lastName: 'Martínez', category: StudentCategory.CHILD, gymId: gym1.id, teacherId: teacher1.id, classGroupId: classGroup2.id },
    { dni: 'student3', firstName: 'Luis', lastName: 'Rodríguez', category: StudentCategory.ADULT, gymId: gym2.id, teacherId: teacher2.id, classGroupId: classGroup3.id },
    { dni: 'student4', firstName: 'Sofía', lastName: 'Fernández', category: StudentCategory.CHILD, gymId: gym2.id, teacherId: teacher2.id, classGroupId: classGroup4.id },
  ];

  for (const data of studentData) {
    await prisma.user.create({
      data: {
        dni: data.dni,
        password: defaultPassword,
        role: Role.STUDENT,
        mustChangePassword: true,
        student: {
          create: {
            firstName: data.firstName,
            lastName: data.lastName,
            category: data.category,
            gymId: data.gymId,
            classGroupId: data.classGroupId,
            teacherId: data.teacherId,
            currentBelt: Belt.WHITE,
            belts: {
              create: {
                belt: Belt.WHITE,
              },
            },
          },
        },
      },
    });
  }

  console.log('✅ Seed finished successfully!');
  console.log('--------------------------------------------------');
  console.log('Admin DNI: admin123 | Pass: 123456');
  console.log('Teacher DNIs: teacher1, teacher2 | Pass: 123456');
  console.log('Student DNIs: student1, student2, student3, student4 | Pass: 123456');
  console.log('--------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
