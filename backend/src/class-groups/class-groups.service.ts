import { Injectable, NotFoundException, ForbiddenException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClassGroupDto } from './dto/create-class-group.dto';
import { UpdateClassGroupDto } from './dto/update-class-group.dto';
import { ClassGroupQueryDto } from './dto/class-group-query.dto';
import { Role, Prisma } from '@prisma/client';

@Injectable()
export class ClassGroupsService {
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
  };

  private validateTimeRange(startTime: string, endTime: string) {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      throw new BadRequestException('El formato de hora debe ser HH:mm');
    }
    if (startTime >= endTime) {
      throw new BadRequestException('La hora de inicio debe ser menor a la hora de fin');
    }
  }

  private async checkForConflicts(
    teacherId: number,
    gymId: number,
    daysOfWeek: any[],
    startTime: string,
    endTime: string,
    category: any,
    excludeId?: number,
  ) {
    const whereClause: any = {
      teacherId,
      gymId,
      category,
      startTime,
      endTime,
      isActive: true,
    };
    
    if (excludeId) {
      whereClause.id = { not: excludeId };
    }

    const existingGroups = await this.prisma.classGroup.findMany({
      where: whereClause,
    });

    for (const group of existingGroups) {
      // Verificar si hay intersección de días
      const hasOverlappingDays = group.daysOfWeek.some((day: any) => daysOfWeek.includes(day));
      if (hasOverlappingDays) {
        throw new ConflictException('Ya existe una comisión activa con estas características en el mismo horario y días');
      }
    }
  }

  async create(actorUserId: number, isAdmin: boolean, createClassGroupDto: CreateClassGroupDto) {
    const { teacherId: dtoTeacherId, gymId, daysOfWeek, startTime, endTime, category, ...rest } = createClassGroupDto;

    this.validateTimeRange(startTime, endTime);

    let teacherIdToUse: number;

    if (isAdmin) {
      if (!dtoTeacherId) {
        throw new ForbiddenException('Un administrador debe especificar el teacherId al crear una comisión');
      }
      const teacher = await this.prisma.teacher.findUnique({ where: { id: dtoTeacherId } });
      if (!teacher) {
        throw new NotFoundException('El profesor asignado no existe');
      }
      teacherIdToUse = teacher.id;
    } else {
      const teacher = await this.prisma.teacher.findUnique({ where: { userId: actorUserId } });
      if (!teacher) {
        throw new ForbiddenException('Perfil de profesor no encontrado');
      }
      teacherIdToUse = teacher.id;
    }

    // Solo validar que el gym existe y no está eliminado (independiente del teacher)
    const gym = await this.prisma.gym.findFirst({
      where: { id: gymId, deletedAt: null },
    });
    if (!gym) {
      throw new NotFoundException('El gimnasio no existe o está eliminado');
    }

    await this.checkForConflicts(teacherIdToUse, gymId, daysOfWeek, startTime, endTime, category);

    const newClassGroup = await this.prisma.classGroup.create({
      data: {
        ...rest,
        category,
        daysOfWeek,
        startTime,
        endTime,
        teacherId: teacherIdToUse,
        gymId,
      },
      include: this.commonInclude,
    });

    return newClassGroup;
  }

  async findAll(query: ClassGroupQueryDto, internalTeacherId?: number) {
    const { teacherId, gymId, isActive } = query;

    const where: Prisma.ClassGroupWhereInput = {};

    if (internalTeacherId) {
      where.teacherId = internalTeacherId;
    } else if (teacherId) {
      where.teacherId = teacherId;
    }

    if (gymId) where.gymId = gymId;
    if (isActive !== undefined) where.isActive = isActive;

    const items = await this.prisma.classGroup.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: this.commonInclude,
    });

    return items;
  }

  async findMyGroupsByUser(userId: number, query: ClassGroupQueryDto) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { userId },
    });

    if (!teacher) {
      throw new NotFoundException('Perfil de profesor no encontrado para este usuario');
    }

    return this.findAll(query, teacher.id);
  }

  async findOne(id: number, userContext?: { id: number; role: Role }) {
    const classGroup = await this.prisma.classGroup.findUnique({
      where: { id },
      include: this.commonInclude,
    });

    if (!classGroup) {
      throw new NotFoundException(`Comisión con ID ${id} no encontrada`);
    }

    if (userContext && userContext.role !== Role.ADMIN) {
      const teacher = await this.prisma.teacher.findUnique({
        where: { userId: userContext.id },
      });
      if (!teacher || classGroup.teacherId !== teacher.id) {
        throw new ForbiddenException('No tienes permiso para ver esta comisión');
      }
    }

    return classGroup;
  }

  async update(id: number, teacherUserId: number | null, updateClassGroupDto: UpdateClassGroupDto) {
    const classGroup = await this.prisma.classGroup.findUnique({
      where: { id },
    });

    if (!classGroup) {
      throw new NotFoundException(`Comisión con ID ${id} no encontrada`);
    }

    // Ownership check for updates
    if (teacherUserId) {
      const teacher = await this.prisma.teacher.findUnique({
        where: { userId: teacherUserId },
      });
      if (!teacher || classGroup.teacherId !== teacher.id) {
        throw new ForbiddenException('No tienes permiso para modificar esta comisión');
      }
    }

    const { daysOfWeek, startTime, endTime, category, gymId, ...rest } = updateClassGroupDto;

    const newStartTime = startTime ?? classGroup.startTime;
    const newEndTime = endTime ?? classGroup.endTime;
    
    if (startTime || endTime) {
      this.validateTimeRange(newStartTime, newEndTime);
    }

    if (gymId) {
      const gym = await this.prisma.gym.findFirst({
        where: { id: gymId, deletedAt: null },
      });
      if (!gym) {
        throw new NotFoundException('El gimnasio no existe o está eliminado');
      }
    }

    const finalGymId = gymId ?? classGroup.gymId;
    const finalDaysOfWeek = daysOfWeek ?? classGroup.daysOfWeek;
    const finalCategory = category ?? classGroup.category;

    // Si se está reactivando o modificando atributos clave, chequear conflictos
    if (updateClassGroupDto.isActive !== false) {
      await this.checkForConflicts(
        classGroup.teacherId,
        finalGymId,
        finalDaysOfWeek as any[],
        newStartTime,
        newEndTime,
        finalCategory,
        id
      );
    }

    const updatedClassGroup = await this.prisma.classGroup.update({
      where: { id },
      data: {
        ...rest,
        category: finalCategory,
        ...(daysOfWeek && { daysOfWeek }),
        startTime: newStartTime,
        endTime: newEndTime,
        gymId: finalGymId,
      },
      include: this.commonInclude,
    });

    // Update students' teacherId and gymId to match the new classGroup settings
    await this.prisma.student.updateMany({
      where: { classGroupId: id },
      data: {
        teacherId: updatedClassGroup.teacherId,
        gymId: updatedClassGroup.gymId,
      },
    });

    return updatedClassGroup;
  }

  async remove(id: number, teacherUserId: number | null) {
    const classGroup = await this.prisma.classGroup.findUnique({
      where: { id },
    });

    if (!classGroup) {
      throw new NotFoundException(`Comisión con ID ${id} no encontrada`);
    }

    if (teacherUserId) {
      const teacher = await this.prisma.teacher.findUnique({
        where: { userId: teacherUserId },
      });
      if (!teacher || classGroup.teacherId !== teacher.id) {
        throw new ForbiddenException('No tienes permiso para eliminar esta comisión');
      }
    }

    if (!classGroup.isActive) {
      throw new BadRequestException('La comisión ya se encuentra inactiva');
    }

    // Soft delete actualizando isActive a false
    await this.prisma.classGroup.update({
      where: { id },
      data: { isActive: false },
    });

    return { success: true, message: 'Comisión desactivada correctamente' };
  }
}
