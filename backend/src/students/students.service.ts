import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentQueryDto } from './dto/student-query.dto';
import { CensusQueryDto, BeltGroup } from './dto/census-query.dto';
import { UpdateOwnStudentProfileDto } from './dto/update-own-student-profile.dto';
import { Prisma, Role, UserStatus, StudentCategory, Belt, FeeStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class StudentsService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly commonInclude = {
    gym: {
      select: {
        id: true,
        name: true,
      },
    },
    classGroup: {
      select: {
        id: true,
        name: true,
        startTime: true,
        endTime: true,
        daysOfWeek: true,
      },
    },
    teacher: {
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
    },
    belts: {
      orderBy: { achievedAt: 'desc' as Prisma.SortOrder },
    },
  };

  private mapStudentResponse(student: any) {
    if (!student) return null;
    const { user, ...studentData } = student;
    return {
      ...studentData,
      dni: user?.dni,
      status: user?.status,
    };
  }

  async create(actorUserId: number, isAdmin: boolean, createStudentDto: CreateStudentDto) {
    const { dni, password, firstName, lastName, classGroupId, category, currentBelt, phone, email, address } = createStudentDto;
    const normalizedFirstName = firstName.trim().toUpperCase();
    const normalizedLastName = lastName.trim().toUpperCase();

    // 1. Validar la Clase (ClassGroup)
    const classGroup = await this.prisma.classGroup.findUnique({
      where: { id: classGroupId }
    });

    if (!classGroup || !classGroup.isActive) {
      throw new NotFoundException('La clase seleccionada no existe o está inactiva');
    }

    // 2. Validar permisos
    if (!isAdmin) {
      const teacher = await this.prisma.teacher.findUnique({
        where: { userId: actorUserId }
      });

      if (!teacher || classGroup.teacherId !== teacher.id) {
        throw new ForbiddenException('No tienes permiso para asignar alumnos a esta clase');
      }
    }

    // 3. Verificar duplicados de DNI
    const existingUser = await this.prisma.user.findUnique({ where: { dni } });
    if (existingUser) {
      throw new ConflictException('Ya existe un usuario con este DNI');
    }

    const rawPassword = password || Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            dni,
            password: hashedPassword,
            role: Role.STUDENT,
            status: UserStatus.ACTIVE,
            mustChangePassword: true,
          },
        });

        const newStudent = await tx.student.create({
          data: {
            userId: newUser.id,
            firstName: normalizedFirstName,
            lastName: normalizedLastName,
            category,
            phone,
            email,
            address,
            classGroupId: classGroup.id,
            gymId: classGroup.gymId,     // Sincronizado
            teacherId: classGroup.teacherId, // Sincronizado
            currentBelt,
            belts: {
              create: {
                belt: currentBelt,
              },
            },
          },
          include: {
            ...this.commonInclude,
            user: true,
          },
        });

        // Buscar configuración de cuotas activa al momento de la creación
        const latestConfig = await tx.feeConfig.findFirst({
          orderBy: { validFrom: 'desc' },
          where: {
            validFrom: {
              lte: new Date(),
            },
          },
        });

        if (!latestConfig) {
          throw new NotFoundException('No se encontró una configuración de cuota activa. Por favor, configure el monto de la cuota primero.');
        }

        // Crear automáticamente la cuota pendiente del mes corriente para el alumno
        const now = new Date();
        const currentMonth = now.getMonth() + 1; // 1-12
        const currentYear = now.getFullYear();
        const dueDate = new Date(currentYear, currentMonth - 1, 10);

        await tx.fee.create({
          data: {
            studentId: newStudent.id,
            month: currentMonth,
            year: currentYear,
            baseAmount: latestConfig.baseAmount,
            totalAmount: latestConfig.baseAmount,
            dueDate,
            status: FeeStatus.PENDING,
            paidAmount: 0,
          },
        });

        return newStudent;
      });

      return {
        ...this.mapStudentResponse(result),
        temporalPassword: password ? undefined : rawPassword,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Ocurrió un error de concurrencia. Ya existe un usuario con este DNI.');
      }
      throw error;
    }
  }

  async findAll(query: StudentQueryDto, internalTeacherId?: number) {
    const { search, gymId, classGroupId, category, belt, includeDeleted, page = 1, limit = 10, teacherId } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.StudentWhereInput = {};

    if (internalTeacherId) {
      where.teacherId = internalTeacherId;
    } else if (teacherId) {
      where.teacherId = teacherId;
    }

    if (!includeDeleted) {
      where.deletedAt = null;
    }

    if (gymId) where.gymId = gymId;
    if (classGroupId) where.classGroupId = classGroupId;
    if (category) where.category = category;
    if (belt) where.currentBelt = belt;

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { user: { dni: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.student.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          ...this.commonInclude,
          user: true,
        },
      }),
      this.prisma.student.count({ where }),
    ]);

    return {
      items: items.map((s) => this.mapStudentResponse(s)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getCensus(query: CensusQueryDto, internalTeacherId?: number) {
    const { gymId, teacherId, category, beltGroup } = query;

    const where: Prisma.StudentWhereInput = {
      deletedAt: null,
    };

    if (internalTeacherId) {
      where.teacherId = internalTeacherId;
    } else if (teacherId) {
      where.teacherId = teacherId;
    }

    if (gymId) where.gymId = gymId;
    if (category) where.category = category;

    // Filter by beltGroup if provided
    if (beltGroup) {
      if (beltGroup === BeltGroup.GROUP1) {
        where.currentBelt = { in: ['WHITE', 'WHITE_YELLOW'] };
      } else if (beltGroup === BeltGroup.GROUP2) {
        where.currentBelt = { in: ['YELLOW', 'GREEN_STRIPE', 'GREEN', 'BLUE_STRIPE'] };
      } else if (beltGroup === BeltGroup.GROUP3) {
        where.currentBelt = { in: ['BLUE', 'RED_STRIPE', 'RED', 'BLACK_STRIPE'] };
      } else if (beltGroup === BeltGroup.GROUP4) {
        where.currentBelt = 'DAN';
      }
    }

    const students = await this.prisma.student.findMany({
      where,
      select: {
        category: true,
        currentBelt: true,
      },
    });

    const total = students.length;
    if (total === 0) {
      return {
        total: 0,
        byCategory: {
          CHILD: { count: 0, percentage: 0 },
          ADULT: { count: 0, percentage: 0 },
        },
        byBeltGroup: {
          group1: { count: 0, percentage: 0 },
          group2: { count: 0, percentage: 0 },
          group3: { count: 0, percentage: 0 },
          group4: { count: 0, percentage: 0 },
        },
      };
    }

    let childCount = 0;
    let adultCount = 0;
    let g1Count = 0;
    let g2Count = 0;
    let g3Count = 0;
    let g4Count = 0;

    for (const s of students) {
      if (s.category === 'CHILD') childCount++;
      else if (s.category === 'ADULT') adultCount++;

      const b = s.currentBelt;
      if (b === 'WHITE' || b === 'WHITE_YELLOW') g1Count++;
      else if (b === 'YELLOW' || b === 'GREEN_STRIPE' || b === 'GREEN' || b === 'BLUE_STRIPE') g2Count++;
      else if (b === 'BLUE' || b === 'RED_STRIPE' || b === 'RED' || b === 'BLACK_STRIPE') g3Count++;
      else if (b === 'DAN') g4Count++;
    }

    const round2 = (num: number) => Math.round(num * 100) / 100;

    return {
      total,
      byCategory: {
        CHILD: { count: childCount, percentage: round2((childCount / total) * 100) },
        ADULT: { count: adultCount, percentage: round2((adultCount / total) * 100) },
      },
      byBeltGroup: {
        group1: { count: g1Count, percentage: round2((g1Count / total) * 100) },
        group2: { count: g2Count, percentage: round2((g2Count / total) * 100) },
        group3: { count: g3Count, percentage: round2((g3Count / total) * 100) },
        group4: { count: g4Count, percentage: round2((g4Count / total) * 100) },
      },
    };
  }

  async findByTeacher(teacherUserId: number, query: StudentQueryDto) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { userId: teacherUserId },
    });

    if (!teacher) {
      throw new NotFoundException('Perfil de profesor no encontrado');
    }

    return this.findAll(query, teacher.id);
  }

  async getTeacherCensus(teacherUserId: number, query: CensusQueryDto) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { userId: teacherUserId },
    });

    if (!teacher) {
      throw new NotFoundException('Perfil de profesor no encontrado');
    }

    return this.getCensus(query, teacher.id);
  }

  async findOne(id: number) {
    const student = await this.prisma.student.findFirst({
      where: { id, deletedAt: null },
      include: {
        ...this.commonInclude,
        user: true,
      },
    });

    if (!student) {
      throw new NotFoundException(`Alumno con ID ${id} no encontrado`);
    }

    return this.mapStudentResponse(student);
  }

  async findOneByDni(dni: string) {
    const student = await this.prisma.student.findFirst({
      where: { user: { dni }, deletedAt: null },
      include: {
        ...this.commonInclude,
        user: true,
      },
    });

    if (!student) {
      throw new NotFoundException(`Alumno con DNI ${dni} no encontrado`);
    }

    return this.mapStudentResponse(student);
  }

  async update(id: number, teacherUserId: number | null, updateStudentDto: UpdateStudentDto) {
    const student = await this.prisma.student.findFirst({
      where: { id, deletedAt: null },
      include: { user: true },
    });

    if (!student) {
      throw new NotFoundException(`Alumno con ID ${id} no encontrado`);
    }

    // 1. Validar Ownership (si es profesor)
    if (teacherUserId) {
      const teacher = await this.prisma.teacher.findUnique({
        where: { userId: teacherUserId }
      });

      if (!teacher || student.teacherId !== teacher.id) {
        throw new ForbiddenException('No tienes permiso para modificar este alumno');
      }
    }

    const { currentBelt, firstName, lastName, classGroupId, gymId, teacherId, ...rest } = updateStudentDto;
    const dataToUpdate: Prisma.StudentUpdateInput = { ...rest };

    // 2. Manejar cambio de Clase y forzar consistencia
    const effectiveClassGroupId = classGroupId || student.classGroupId;
    
    const currentClassGroup = await this.prisma.classGroup.findUnique({
      where: { id: effectiveClassGroupId }
    });

    if (!currentClassGroup || !currentClassGroup.isActive) {
      throw new NotFoundException('La clase asignada no existe o está inactiva');
    }

    // Si se cambia la clase, validar que la nueva también sea del profesor
    if (classGroupId && classGroupId !== student.classGroupId && teacherUserId) {
      const teacher = await this.prisma.teacher.findUnique({ where: { userId: teacherUserId } });
      if (currentClassGroup.teacherId !== teacher?.id) {
        throw new ForbiddenException('No puedes mover al alumno a una clase que no te pertenece');
      }
    }

    // Sincronización estricta: ignora gymId/teacherId manuales del DTO
    dataToUpdate.classGroup = { connect: { id: effectiveClassGroupId } };
    dataToUpdate.gym = { connect: { id: currentClassGroup.gymId } };
    dataToUpdate.teacher = { connect: { id: currentClassGroup.teacherId } };

    if (firstName) dataToUpdate.firstName = firstName.trim().toUpperCase();
    if (lastName) dataToUpdate.lastName = lastName.trim().toUpperCase();

    if (currentBelt && currentBelt !== student.currentBelt) {
      dataToUpdate.currentBelt = currentBelt;
      dataToUpdate.belts = {
        create: { belt: currentBelt },
      };
    }

    const updatedStudent = await this.prisma.student.update({
      where: { id },
      data: dataToUpdate,
      include: {
        ...this.commonInclude,
        user: true,
      },
    });

    return this.mapStudentResponse(updatedStudent);
  }

  async remove(id: number, teacherUserId: number | null) {
    const student = await this.prisma.student.findFirst({
      where: { id, deletedAt: null },
      include: { user: true },
    });

    if (!student) {
      throw new NotFoundException(`Alumno con ID ${id} no encontrado`);
    }

    if (teacherUserId) {
      const teacher = await this.prisma.teacher.findUnique({
        where: { userId: teacherUserId },
      });
      if (!teacher || student.teacherId !== teacher.id) {
        throw new ForbiddenException('No tienes permiso para eliminar este alumno');
      }
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.student.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      await tx.user.update({
        where: { id: student.userId },
        data: { 
          status: UserStatus.BLOCKED,
          deletedAt: new Date(), 
          dni: `${student.user.dni}_del_${Date.now()}`,
        },
      });
    });

    return { success: true, message: 'Alumno eliminado correctamente' };
  }

  async updateOwnProfile(userId: number, updateOwnProfileDto: UpdateOwnStudentProfileDto) {
    const student = await this.prisma.student.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!student || student.deletedAt !== null) {
      throw new NotFoundException('Perfil de alumno no encontrado');
    }

    const updatedStudent = await this.prisma.student.update({
      where: { id: student.id },
      data: updateOwnProfileDto,
      include: {
        ...this.commonInclude,
        user: true,
      },
    });

    return this.mapStudentResponse(updatedStudent);
  }

  async findOwnProfile(userId: number) {
    const student = await this.prisma.student.findUnique({
      where: { userId },
      include: {
        ...this.commonInclude,
        user: true,
      },
    });

    if (!student || student.deletedAt !== null) {
      throw new NotFoundException('Perfil de alumno no encontrado');
    }

    return this.mapStudentResponse(student);
  }

  async findOwnTeacher(userId: number) {
    const student = await this.prisma.student.findUnique({
      where: { userId },
      include: {
        teacher: true,
      },
    });

    if (!student || student.deletedAt !== null) {
      throw new NotFoundException('Perfil de alumno no encontrado');
    }

    if (!student.teacher || student.teacher.deletedAt !== null) {
      throw new NotFoundException('No tenés un profesor asignado o no se encuentra activo');
    }

    return {
      firstName: student.teacher.firstName,
      lastName: student.teacher.lastName,
      phone: student.teacher.phone,
      email: student.teacher.email,
      qrCodeUrl: student.teacher.qrCodeUrl,
      walletUrl: student.teacher.walletUrl,
    };
  }

  async resetStudentPasswordByTeacher(teacherUserId: number, dni: string) {
    const teacher = await this.prisma.teacher.findUnique({ where: { userId: teacherUserId } });
    if (!teacher) throw new NotFoundException('Profesor no encontrado');

    const student = await this.prisma.student.findFirst({
      where: { user: { dni }, teacherId: teacher.id, deletedAt: null },
      include: { user: true },
    });

    if (!student || !student.userId) {
      throw new NotFoundException('Alumno no encontrado o no te pertenece');
    }

    const temporaryPassword = '123456';
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    await this.prisma.user.update({
      where: { id: student.userId },
      data: { password: hashedPassword, mustChangePassword: true },
    });

    return { temporaryPassword };
  }
}
