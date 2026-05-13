import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentQueryDto } from './dto/student-query.dto';
import { UpdateOwnStudentProfileDto } from './dto/update-own-student-profile.dto';
import { Prisma, Role, UserStatus } from '@prisma/client';
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

  //
  async create(actorUserId: number, isAdmin: boolean, createStudentDto: CreateStudentDto) {
    const { dni, password, firstName, lastName, gymId, category, currentBelt, phone, email, address, teacherId: dtoTeacherId } = createStudentDto;
    const normalizedFirstName = firstName.trim().toUpperCase();
    const normalizedLastName = lastName.trim().toUpperCase();

    let teacher;
    if (isAdmin) {
      if (!dtoTeacherId) {
        throw new ForbiddenException('Un administrador debe especificar el teacherId al crear un alumno');
      }
      teacher = await this.prisma.teacher.findUnique({
        where: { id: dtoTeacherId },
        include: { gyms: true },
      });
    } else {
      teacher = await this.prisma.teacher.findUnique({
        where: { userId: actorUserId },
        include: { gyms: true },
      });
    }

    if (!teacher) {
      throw new ForbiddenException('Profesor no encontrado o no asignado');
    }

    const gym = teacher.gyms.find(g => g.id === gymId && g.deletedAt === null);
    if (!gym) {
      throw new ForbiddenException('El gimnasio no existe o no pertenece al profesor asignado');
    }

    const existingUser = await this.prisma.user.findUnique({ where: { dni } });
    if (existingUser) {
      throw new ConflictException('Ya existe un usuario con este DNI');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

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
            gymId,
            teacherId: teacher.id,
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

        return newStudent;
      });

      return this.mapStudentResponse(result);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Ocurrió un error de concurrencia. Ya existe un usuario con este DNI.');
      }
      throw error;
    }
  }

  async findAll(query: StudentQueryDto, internalTeacherId?: number) {
    const { search, gymId, category, belt, includeDeleted, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.StudentWhereInput = {};

    if (internalTeacherId) {
      where.teacherId = internalTeacherId;
    }

    if (!includeDeleted) {
      where.deletedAt = null;
    }

    if (gymId) where.gymId = gymId;
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

  async findByTeacher(teacherUserId: number, query: StudentQueryDto) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { userId: teacherUserId },
    });

    if (!teacher) {
      throw new NotFoundException('Perfil de profesor no encontrado');
    }

    return this.findAll(query, teacher.id);
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

  async update(id: number, teacherUserId: number | null, updateStudentDto: UpdateStudentDto) {
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
        include: { gyms: true },
      });

      if (!teacher || student.teacherId !== teacher.id) {
        throw new ForbiddenException('No tienes permiso para modificar este alumno');
      }

      if (updateStudentDto.gymId) {
        const gym = teacher.gyms.find(g => g.id === updateStudentDto.gymId && g.deletedAt === null);
        if (!gym) {
          throw new ForbiddenException('El gimnasio no existe o no te pertenece');
        }
      }
    } else if (updateStudentDto.gymId) {
      const gym = await this.prisma.gym.findFirst({
        where: { id: updateStudentDto.gymId, teacherId: student.teacherId, deletedAt: null },
      });
      if (!gym) {
        throw new ForbiddenException('El gimnasio no existe o no pertenece al profesor asignado a este alumno');
      }
    }

    const { currentBelt, firstName, lastName, ...rest } = updateStudentDto;
    
    const dataToUpdate: Prisma.StudentUpdateInput = { ...rest };

    if (firstName) {
      dataToUpdate.firstName = firstName.trim().toUpperCase();
    }
    if (lastName) {
      dataToUpdate.lastName = lastName.trim().toUpperCase();
    }

    if (currentBelt && currentBelt !== student.currentBelt) {
      dataToUpdate.currentBelt = currentBelt;
      dataToUpdate.belts = {
        create: {
          belt: currentBelt,
        },
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
}
