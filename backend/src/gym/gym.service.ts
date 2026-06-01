import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGymDto } from './dto/create-gym.dto';
import { UpdateGymDto } from './dto/update-gym.dto';
import { GymQueryDto } from './dto/gym-query.dto';
import { Prisma, Role } from '@prisma/client';

@Injectable()
export class GymService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly commonInclude = {
    classGroups: {
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        category: true,
        daysOfWeek: true,
        startTime: true,
        endTime: true,
      },
    },
  };

  private mapGymResponse(gym: any) {
    if (!gym) return null;
    return gym;
  }

  async create(createGymDto: CreateGymDto) {
    const normalizedName = createGymDto.name.trim().toUpperCase();

    const existingGym = await this.prisma.gym.findFirst({
      where: {
        name: normalizedName,
        deletedAt: null,
      },
    });

    if (existingGym) {
      throw new ConflictException(
        `Ya existe un gimnasio activo con el nombre "${normalizedName}"`
      );
    }

    const newGym = await this.prisma.gym.create({
      data: {
        name: normalizedName,
      },
      include: this.commonInclude,
    });

    return this.mapGymResponse(newGym);
  }

  async findAll(query: GymQueryDto) {
    const { isActive, search, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.GymWhereInput = {
      deletedAt: null,
    };
    
    if (isActive !== undefined) where.isActive = isActive;
    
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const [items, total] = await Promise.all([
      this.prisma.gym.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: this.commonInclude,
      }),
      this.prisma.gym.count({ where }),
    ]);

    return {
      items: items.map((gym) => this.mapGymResponse(gym)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const gym = await this.prisma.gym.findFirst({
      where: { id, deletedAt: null },
      include: this.commonInclude,
    });

    if (!gym) {
      throw new NotFoundException(`Gimnasio con ID ${id} no encontrado`);
    }

    return this.mapGymResponse(gym);
  }


  async update(id: number, updateGymDto: UpdateGymDto) {
    const gym = await this.prisma.gym.findFirst({
      where: { id, deletedAt: null },
    });

    if (!gym) {
      throw new NotFoundException(`Gimnasio con ID ${id} no encontrado`);
    }

    if (updateGymDto.name) {
      const normalizedName = updateGymDto.name.trim().toUpperCase();
      
      const existingGym = await this.prisma.gym.findFirst({
        where: {
          name: normalizedName,
          deletedAt: null,
          NOT: { id },
        },
      });

      if (existingGym) {
        throw new ConflictException(
          `Ya existe otro gimnasio activo llamado "${normalizedName}"`
        );
      }
      
      updateGymDto.name = normalizedName;
    }

    const updatedGym = await this.prisma.gym.update({
      where: { id },
      data: updateGymDto,
      include: this.commonInclude,
    });

    return this.mapGymResponse(updatedGym);
  }

  async findMyGymsByUser(userId: number, query: GymQueryDto) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { userId },
    });

    if (!teacher) {
      throw new NotFoundException('Perfil de profesor no encontrado para este usuario');
    }

    const { isActive, search, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.GymWhereInput = {
      deletedAt: null,
    };
    
    if (isActive !== undefined) where.isActive = isActive;
    if (search) where.name = { contains: search, mode: 'insensitive' };

    const [items, total] = await Promise.all([
      this.prisma.gym.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: this.commonInclude,
      }),
      this.prisma.gym.count({ where }),
    ]);

    const itemsWithCount = await Promise.all(items.map(async (gym) => {
      const studentsCount = await this.prisma.student.count({
        where: {
          gymId: gym.id,
          teacherId: teacher.id,
          deletedAt: null,
        }
      });
      return { ...gym, studentsCount };
    }));

    return {
      items: itemsWithCount.map((gym) => this.mapGymResponse(gym)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async remove(id: number) {
    const gymData = await this.prisma.gym.findFirst({
      where: { id, deletedAt: null },
    });

    if (!gymData) {
      throw new NotFoundException(`Gimnasio con ID ${id} no encontrado`);
    }

    await this.prisma.gym.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });

    return { success: true, message: 'Gimnasio eliminado correctamente' };
  }

}

