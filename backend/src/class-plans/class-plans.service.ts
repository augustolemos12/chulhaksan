import { Injectable, NotFoundException, BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClassPlanDto } from './dto/create-class-plan.dto';
import { UpdateClassPlanDto } from './dto/update-class-plan.dto';
import { ClassPlanQueryDto } from './dto/class-plan-query.dto';
import { Prisma, Role } from '@prisma/client';

@Injectable()
export class ClassPlansService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly commonInclude = {
    classGroup: {
      select: {
        id: true,
        name: true,
        category: true,
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
      },
    },
  };

  async create(createClassPlanDto: CreateClassPlanDto, actor: { id: number; role: Role }) {
    const { classGroupId, month, year, totalClasses } = createClassPlanDto;

    // 1. Validar ClassGroup
    const classGroup = await this.prisma.classGroup.findUnique({
      where: { id: classGroupId },
    });

    if (!classGroup || !classGroup.isActive) {
      throw new BadRequestException('La clase seleccionada no existe o está inactiva');
    }

    // 2. Ownership
    if (actor.role === Role.TEACHER) {
      const teacher = await this.prisma.teacher.findUnique({
        where: { userId: actor.id },
      });
      if (!teacher || classGroup.teacherId !== teacher.id) {
        throw new ForbiddenException('No tienes permiso para crear planes para esta clase');
      }
    }

    // 3. Crear (Manejar duplicado)
    try {
      return await this.prisma.classPlan.create({
        data: {
          classGroupId,
          month,
          year,
          totalClasses,
        },
        include: this.commonInclude,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException(
          `Ya existe un plan de clases para esta clase en ${month}/${year}`
        );
      }
      throw error;
    }
  }

  async findAll(query: ClassPlanQueryDto, actor: { id: number; role: Role }) {
    const { classGroupId, gymId, teacherId, month, year, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ClassPlanWhereInput = {};

    if (month) where.month = month;
    if (year) where.year = year;
    
    // Filtro por clase específica
    if (classGroupId) {
        where.classGroupId = classGroupId;
    } else if (gymId || teacherId) {
        where.classGroup = {
            ...(gymId ? { gymId } : {}),
            ...(teacherId ? { teacherId } : {}),
        };
    }

    // Restricción de Ownership para TEACHER
    if (actor.role === Role.TEACHER) {
      const teacher = await this.prisma.teacher.findUnique({
        where: { userId: actor.id },
      });
      
      if (!teacher) {
        throw new ForbiddenException('Perfil de profesor no encontrado');
      }

      // Si el profesor pidió una clase específica, ya se filtró arriba, 
      // pero debemos asegurar que sea SUYA.
      // Si no pidió ninguna, mostramos todas las SUYAS.
      where.classGroup = {
        ...((where.classGroup as Prisma.ClassGroupWhereInput) || {}),
        teacherId: teacher.id,
      };
    }

    const [items, total] = await Promise.all([
      this.prisma.classPlan.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
        include: this.commonInclude,
      }),
      this.prisma.classPlan.count({ where }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number, actor: { id: number; role: Role }) {
    const classPlan = await this.prisma.classPlan.findUnique({
      where: { id },
      include: this.commonInclude,
    });

    if (!classPlan) {
      throw new NotFoundException(`Plan de clases con ID ${id} no encontrado`);
    }

    // Ownership check
    if (actor.role === Role.TEACHER) {
      const teacher = await this.prisma.teacher.findUnique({
        where: { userId: actor.id },
      });
      if (!teacher || classPlan.classGroup.teacher.id !== teacher.id) {
        throw new ForbiddenException('No tienes permiso para ver este plan de clases');
      }
    }

    return classPlan;
  }

  async update(id: number, updateClassPlanDto: UpdateClassPlanDto, actor: { id: number; role: Role }) {
    const classPlan = await this.findOne(id, actor); // Incluye chequeo de existencia y ownership

    const { classGroupId, month, year } = updateClassPlanDto;

    // Si se cambia la clase, validar
    if (classGroupId && classGroupId !== classPlan.classGroupId) {
        const newClassGroup = await this.prisma.classGroup.findUnique({
            where: { id: classGroupId },
        });
        if (!newClassGroup || !newClassGroup.isActive) {
            throw new BadRequestException('La nueva clase no existe o está inactiva');
        }
        
        if (actor.role === Role.TEACHER) {
            const teacher = await this.prisma.teacher.findUnique({ where: { userId: actor.id } });
            if (newClassGroup.teacherId !== teacher?.id) {
                throw new ForbiddenException('No puedes mover el plan a una clase que no te pertenece');
            }
        }
    }

    try {
      return await this.prisma.classPlan.update({
        where: { id },
        data: updateClassPlanDto,
        include: this.commonInclude,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException(
          `Ya existe un plan de clases para esta clase en el periodo especificado`
        );
      }
      throw error;
    }
  }

  async remove(id: number, actor: { id: number; role: Role }) {
    await this.findOne(id, actor); // Valida existencia y ownership

    await this.prisma.classPlan.delete({
      where: { id },
    });

    return { success: true, message: 'Plan de clases eliminado correctamente' };
  }
}
