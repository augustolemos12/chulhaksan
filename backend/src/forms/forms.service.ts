import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { Belt } from '@prisma/client';

const BELT_ORDER = [
  Belt.WHITE,
  Belt.WHITE_YELLOW,
  Belt.YELLOW,
  Belt.GREEN_STRIPE,
  Belt.GREEN,
  Belt.BLUE_STRIPE,
  Belt.BLUE,
  Belt.RED_STRIPE,
  Belt.RED,
  Belt.BLACK_STRIPE,
  Belt.DAN,
];

@Injectable()
export class FormsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createFormDto: CreateFormDto) {
    return this.prisma.form.create({
      data: createFormDto,
    });
  }

  async findAll() {
    return this.prisma.form.findMany({
      orderBy: { createdAt: 'asc' },
    });
  }

  async findUnlockedForStudent(userId: number) {
    const student = await this.prisma.student.findUnique({
      where: { userId },
    });

    if (!student) {
      throw new NotFoundException('Alumno no encontrado');
    }

    const currentBeltIndex = BELT_ORDER.indexOf(student.currentBelt);
    if (currentBeltIndex === -1) {
      return [];
    }

    const unlockedBelts = BELT_ORDER.slice(0, currentBeltIndex + 1);

    return this.prisma.form.findMany({
      where: {
        requiredBelt: {
          in: unlockedBelts,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async update(id: number, updateFormDto: UpdateFormDto) {
    const form = await this.prisma.form.findUnique({ where: { id } });
    if (!form) {
      throw new NotFoundException(`Forma con ID ${id} no encontrada`);
    }

    return this.prisma.form.update({
      where: { id },
      data: updateFormDto,
    });
  }

  async remove(id: number) {
    const form = await this.prisma.form.findUnique({ where: { id } });
    if (!form) {
      throw new NotFoundException(`Forma con ID ${id} no encontrada`);
    }

    return this.prisma.form.delete({
      where: { id },
    });
  }
}
