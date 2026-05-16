import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
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

  async create(actorUserId: number, isAdmin: boolean, createClassGroupDto: CreateClassGroupDto) {
    const { teacherId: dtoTeacherId, gymId, daysOfWeek, ...rest } = createClassGroupDto;

    let teacher;
    if (isAdmin) {
      if (!dtoTeacherId) {
        throw new ForbiddenException('Un administrador debe especificar el teacherId al crear una comisión');
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

    const gym = teacher.gyms.find((g) => g.id === gymId && g.deletedAt === null);
    if (!gym) {
      throw new ForbiddenException('El gimnasio no existe o no pertenece al profesor asignado');
    }

    const newClassGroup = await this.prisma.classGroup.create({
      data: {
        ...rest,
        daysOfWeek: daysOfWeek as any,
        teacherId: teacher.id,
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

    if (teacherUserId) {
      const teacher = await this.prisma.teacher.findUnique({
        where: { userId: teacherUserId },
        include: { gyms: true },
      });

      if (!teacher || classGroup.teacherId !== teacher.id) {
        throw new ForbiddenException('No tienes permiso para modificar esta comisión');
      }

      if (updateClassGroupDto.gymId) {
        const gym = teacher.gyms.find((g) => g.id === updateClassGroupDto.gymId && g.deletedAt === null);
        if (!gym) {
          throw new ForbiddenException('El gimnasio no existe o no te pertenece');
        }
      }
    } else if (updateClassGroupDto.gymId) {
       const gym = await this.prisma.gym.findFirst({
        where: { id: updateClassGroupDto.gymId, teacherId: classGroup.teacherId, deletedAt: null },
      });
      if (!gym) {
        throw new ForbiddenException('El gimnasio no existe o no pertenece al profesor asignado a esta comisión');
      }
    }

    const { daysOfWeek, ...rest } = updateClassGroupDto;
    
    const updatedClassGroup = await this.prisma.classGroup.update({
      where: { id },
      data: {
        ...rest,
        ...(daysOfWeek && { daysOfWeek: daysOfWeek as any }),
      },
      include: this.commonInclude,
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

    try {
      await this.prisma.classGroup.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
         throw new ConflictException('No se puede eliminar la comisión porque tiene alumnos o registros asociados.');
      }
      throw error;
    }

    return { success: true, message: 'Comisión eliminada correctamente' };
  }
}
