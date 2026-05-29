import { PrismaClient, Role, StudentCategory, Belt, DayOfWeek, FeeStatus, PaymentMethod, PaymentStatus } from '@prisma/client';
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
  await prisma.feeConfig.deleteMany();
  await prisma.form.deleteMany();
  await prisma.event.deleteMany();

  const defaultPassword = await bcrypt.hash('123456', 10);

  // 2. Create Admin
  console.log('👑 Creating Admin...');
  await prisma.user.create({
    data: {
      dni: '99999999',
      password: defaultPassword,
      role: Role.ADMIN,
      mustChangePassword: false,
    },
  });

  // 3. Create Teachers
  console.log('👨‍🏫 Creating Teachers...');
  const teacherUser1 = await prisma.user.create({
    data: {
      dni: '11111111',
      password: defaultPassword,
      role: Role.TEACHER,
      mustChangePassword: false,
      teacher: {
        create: {
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juan@chulhaksan.com',
          phone: '1234567890',
          qrCodeUrl: 'https://res.cloudinary.com/demo/image/upload/v1620000000/sample_qr.png',
          walletUrl: 'https://link.mercadopago.com.ar/chulhaksan-juan',
        },
      },
    },
    include: { teacher: true },
  });

  const teacherUser2 = await prisma.user.create({
    data: {
      dni: '22222222',
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
    { dni: '33333333', firstName: 'Carlos', lastName: 'López', category: StudentCategory.ADULT, gymId: gym1.id, teacherId: teacher1.id, classGroupId: classGroup1.id },
    { dni: '44444444', firstName: 'Ana', lastName: 'Martínez', category: StudentCategory.CHILD, gymId: gym1.id, teacherId: teacher1.id, classGroupId: classGroup2.id },
    { dni: '55555555', firstName: 'Luis', lastName: 'Rodríguez', category: StudentCategory.ADULT, gymId: gym2.id, teacherId: teacher2.id, classGroupId: classGroup3.id },
    { dni: '66666666', firstName: 'Sofía', lastName: 'Fernández', category: StudentCategory.CHILD, gymId: gym2.id, teacherId: teacher2.id, classGroupId: classGroup4.id },
  ];

  const studentsList: any[] = [];

  for (const data of studentData) {
    const user = await prisma.user.create({
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
      include: { student: true },
    });
    studentsList.push(user.student);
  }

  // 7. Create FeeConfig
  console.log('💰 Creating FeeConfig...');
  const baseAmount = 15000;
  const lateFee = 2000;
  await prisma.feeConfig.create({
    data: {
      baseAmount,
      lateFee,
      validFrom: new Date('2026-01-01'),
    },
  });

  // 8. Create Forms
  console.log('📄 Creating Forms...');
  await prisma.form.createMany({
    data: [
      { title: 'Saju Jirugi & Saju Makgi', url: 'https://www.youtube.com/watch?v=sajujirugi', requiredBelt: Belt.WHITE },
      { title: 'Chon-Ji Tul', url: 'https://www.youtube.com/watch?v=chonji', requiredBelt: Belt.WHITE_YELLOW },
      { title: 'Dan-Gun Tul', url: 'https://www.youtube.com/watch?v=dangun', requiredBelt: Belt.YELLOW },
    ],
  });

  // 9. Create Events
  console.log('📅 Creating Events...');
  await prisma.event.createMany({
    data: [
      { title: 'Torneo de Invierno Chulhaksan 2026', imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1620000000/sample.jpg' },
      { title: 'Clase Especial con Gran Maestro - Junio', imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1620000000/sample.jpg' },
    ],
  });

  // 10. Create Fees and Transactions
  console.log('💳 Creating Fees and Transactions...');
  // Find students by firstName
  const carlos = studentsList.find((s) => s.firstName === 'Carlos');
  const ana = studentsList.find((s) => s.firstName === 'Ana');
  const luis = studentsList.find((s) => s.firstName === 'Luis');
  const sofia = studentsList.find((s) => s.firstName === 'Sofía');

  if (carlos) {
    // Carlos: Paid April Fee, Pending May Fee
    await prisma.fee.create({
      data: {
        studentId: carlos.id,
        month: 4,
        year: 2026,
        status: FeeStatus.PAID,
        baseAmount,
        surchargeAmount: 0,
        totalAmount: baseAmount,
        paidAmount: baseAmount,
        dueDate: new Date('2026-04-10T00:00:00Z'),
        payments: {
          create: {
            amount: baseAmount,
            method: PaymentMethod.TRANSFER,
            status: PaymentStatus.APPROVED,
            proofImageUrl: 'https://res.cloudinary.com/demo/image/upload/v1620000000/sample_receipt.png',
            reviewedAt: new Date(),
          },
        },
      },
    });

    await prisma.fee.create({
      data: {
        studentId: carlos.id,
        month: 5,
        year: 2026,
        status: FeeStatus.PENDING,
        baseAmount,
        surchargeAmount: 0,
        totalAmount: baseAmount,
        paidAmount: 0,
        dueDate: new Date('2026-05-10T00:00:00Z'),
      },
    });
  }

  if (ana) {
    // Ana: Paid April Fee, Partially Paid May Fee (with an approved payment and a pending payment)
    await prisma.fee.create({
      data: {
        studentId: ana.id,
        month: 4,
        year: 2026,
        status: FeeStatus.PAID,
        baseAmount,
        surchargeAmount: 0,
        totalAmount: baseAmount,
        paidAmount: baseAmount,
        dueDate: new Date('2026-04-10T00:00:00Z'),
        payments: {
          create: {
            amount: baseAmount,
            method: PaymentMethod.CASH,
            status: PaymentStatus.APPROVED,
            reviewedAt: new Date(),
          },
        },
      },
    });

    await prisma.fee.create({
      data: {
        studentId: ana.id,
        month: 5,
        year: 2026,
        status: FeeStatus.PARTIALLY_PAID,
        baseAmount,
        surchargeAmount: 0,
        totalAmount: baseAmount,
        paidAmount: 8000,
        dueDate: new Date('2026-05-10T00:00:00Z'),
        payments: {
          createMany: {
            data: [
              {
                amount: 8000,
                method: PaymentMethod.TRANSFER,
                status: PaymentStatus.APPROVED,
                proofImageUrl: 'https://res.cloudinary.com/demo/image/upload/v1620000000/sample_receipt.png',
                reviewedAt: new Date(),
              },
              {
                amount: 7000,
                method: PaymentMethod.TRANSFER,
                status: PaymentStatus.PENDING,
                proofImageUrl: 'https://res.cloudinary.com/demo/image/upload/v1620000000/sample_receipt2.png',
              },
            ],
          },
        },
      },
    });
  }

  if (luis) {
    // Luis: Pending May Fee, with late fee applied (surcharge) and a pending transaction
    await prisma.fee.create({
      data: {
        studentId: luis.id,
        month: 5,
        year: 2026,
        status: FeeStatus.PENDING,
        baseAmount,
        surchargeAmount: lateFee,
        totalAmount: baseAmount + lateFee,
        paidAmount: 0,
        dueDate: new Date('2026-05-10T00:00:00Z'),
        lateFeeApplied: true,
        payments: {
          create: {
            amount: baseAmount + lateFee,
            method: PaymentMethod.TRANSFER,
            status: PaymentStatus.PENDING,
            proofImageUrl: 'https://res.cloudinary.com/demo/image/upload/v1620000000/sample_receipt.png',
          },
        },
      },
    });
  }

  if (sofia) {
    // Sofia: Pending May Fee, no transaction
    await prisma.fee.create({
      data: {
        studentId: sofia.id,
        month: 5,
        year: 2026,
        status: FeeStatus.PENDING,
        baseAmount,
        surchargeAmount: 0,
        totalAmount: baseAmount,
        paidAmount: 0,
        dueDate: new Date('2026-05-10T00:00:00Z'),
      },
    });
  }

  console.log('✅ Seed finished successfully!');
  console.log('--------------------------------------------------');
  console.log('Admin DNI: 99999999 | Pass: 123456');
  console.log('Teacher DNIs: 11111111, 22222222 | Pass: 123456');
  console.log('Student DNIs: 33333333, 44444444, 55555555, 66666666 | Pass: 123456');
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

