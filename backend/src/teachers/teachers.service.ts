import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { TeacherQueryDto } from './dto/teacher-query.dto';
import { UpdateTeacherPaymentDto } from './dto/update-teacher-payment.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Role, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TeachersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  private mapTeacherResponse(teacher: any) {
    if (!teacher) return null;
    const { user, ...teacherData } = teacher;
    return {
      ...teacherData,
      dni: user?.dni,
      status: user?.status,
      mustChangePassword: user?.mustChangePassword,
    };
  }

  async create(createTeacherDto: CreateTeacherDto) {
    const { dni, firstName, lastName, phone, email, password } = createTeacherDto;

    const existingUser = await this.prisma.user.findUnique({ where: { dni } });
    if (existingUser) {
      throw new ConflictException('Ya existe un usuario con ese DNI');
    }

    const rawPassword = password || '123456';
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const result = await this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          dni,
          password: hashedPassword,
          role: Role.TEACHER,
          mustChangePassword: true,
        },
      });

      const newTeacher = await tx.teacher.create({
        data: {
          userId: newUser.id,
          firstName,
          lastName,
          phone,
          email,
        },
        include: {
          user: true,
          classGroups: {
            where: { isActive: true }
          }
        },
      });

      return newTeacher;
    });

    return {
      teacher: this.mapTeacherResponse(result),
      temporalPassword: password ? undefined : rawPassword,
    };
  }

  async findAll(query: TeacherQueryDto) {
    const { search, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.TeacherWhereInput = {
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { user: { dni: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.teacher.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { 
          user: true,
          classGroups: {
            where: { isActive: true }
          }
        },
      }),
      this.prisma.teacher.count({ where }),
    ]);

    return {
      items: items.map((t) => this.mapTeacherResponse(t)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const teacher = await this.prisma.teacher.findFirst({
      where: { id, deletedAt: null },
      include: { 
        user: true,
        classGroups: {
          where: { isActive: true }
        }
      },
    });

    if (!teacher) {
      throw new NotFoundException(`Profesor con ID ${id} no encontrado`);
    }

    return this.mapTeacherResponse(teacher);
  }

  async update(id: number, updateTeacherDto: UpdateTeacherDto) {
    await this.findOne(id);

    const updatedTeacher = await this.prisma.teacher.update({
      where: { id },
      data: updateTeacherDto,
      include: { 
        user: true,
        classGroups: {
          where: { isActive: true }
        }
      },
    });

    return this.mapTeacherResponse(updatedTeacher);
  }

  async remove(id: number) {
    const teacherData = await this.prisma.teacher.findFirst({
      where: { id, deletedAt: null },
    });

    if (!teacherData) {
      throw new NotFoundException(`Profesor con ID ${id} no encontrado`);
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.teacher.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      await tx.user.update({
        where: { id: teacherData.userId },
        data: { status: 'BLOCKED' },
      });
    });

    return { success: true, message: 'Profesor eliminado correctamente' };
  }

  async findOwnProfile(userId: number) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { userId },
      include: {
        user: true,
        classGroups: {
          where: { isActive: true },
        },
      },
    });

    if (!teacher || teacher.deletedAt !== null) {
      throw new NotFoundException('Perfil de profesor no encontrado');
    }

    return this.mapTeacherResponse(teacher);
  }

  async updatePaymentDetails(
    teacherId: number,
    dto: UpdateTeacherPaymentDto,
    files?: {
      qrCode?: Express.Multer.File[];
      lateFeeQrCode?: Express.Multer.File[];
    },
  ) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: teacherId },
    });

    if (!teacher || teacher.deletedAt !== null) {
      throw new NotFoundException('Perfil de profesor no encontrado');
    }

    let qrCodeUrl = teacher.qrCodeUrl;
    let lateFeeQrCodeUrl = teacher.lateFeeQrCodeUrl;

    if (files?.qrCode && files.qrCode.length > 0) {
      if (teacher.qrCodeUrl) {
        try {
          const publicId = this.cloudinaryService.extractPublicId(teacher.qrCodeUrl);
          if (publicId) await this.cloudinaryService.deleteFile(publicId);
        } catch (err) {
          console.error('Error deleting previous QR from Cloudinary:', err);
        }
      }
      const uploadResult = await this.cloudinaryService.uploadQrCode(files.qrCode[0]);
      qrCodeUrl = uploadResult.secure_url;
    }

    if (files?.lateFeeQrCode && files.lateFeeQrCode.length > 0) {
      if (teacher.lateFeeQrCodeUrl) {
        try {
          const publicId = this.cloudinaryService.extractPublicId(teacher.lateFeeQrCodeUrl);
          if (publicId) await this.cloudinaryService.deleteFile(publicId);
        } catch (err) {
          console.error('Error deleting previous Late Fee QR from Cloudinary:', err);
        }
      }
      const uploadResult = await this.cloudinaryService.uploadQrCode(files.lateFeeQrCode[0]);
      lateFeeQrCodeUrl = uploadResult.secure_url;
    }

    const updatedTeacher = await this.prisma.teacher.update({
      where: { id: teacher.id },
      data: {
        walletUrl: dto.walletUrl === undefined ? teacher.walletUrl : (dto.walletUrl || null),
        lateFeeWalletUrl: dto.lateFeeWalletUrl === undefined ? teacher.lateFeeWalletUrl : (dto.lateFeeWalletUrl || null),
        qrCodeUrl,
        lateFeeQrCodeUrl,
      },
      include: {
        user: true,
        classGroups: {
          where: { isActive: true },
        },
      },
    });

    return this.mapTeacherResponse(updatedTeacher);
  }
}

