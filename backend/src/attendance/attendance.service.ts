import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RecordAttendanceDto } from './dto/record-attendance.dto';
import { AttendanceQueryDto } from './dto/attendance-query.dto';
import { Prisma, Role } from '@prisma/client';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  private normalizeAttendanceDate(dateStr: string): Date {
    const d = new Date(dateStr);
    d.setUTCHours(0, 0, 0, 0);
    return d;
  }

  private startOfDayUTC(dateStr: string): Date {
    return this.normalizeAttendanceDate(dateStr);
  }

  private endOfDayUTC(dateStr: string): Date {
    const d = new Date(dateStr);
    d.setUTCHours(23, 59, 59, 999);
    return d;
  }

  async recordAttendance(actorUserId: number, role: Role, recordDto: RecordAttendanceDto) {
    const { classGroupId, date, records } = recordDto;

    // Validar duplicados en el payload
    const studentIds = records.map((r) => r.studentId);
    const uniqueIds = new Set(studentIds);
    if (uniqueIds.size !== studentIds.length) {
      throw new BadRequestException('El payload contiene alumnos duplicados');
    }

    const attendanceDate = this.normalizeAttendanceDate(date);

    // Validar que no sea fecha futura
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    if (attendanceDate > today) {
      throw new BadRequestException('No se puede registrar asistencia en una fecha futura');
    }

    // Verificar si la comisión existe
    const classGroup = await this.prisma.classGroup.findUnique({
      where: { id: classGroupId },
      include: { teacher: true },
    });

    if (!classGroup) {
      throw new NotFoundException(`Comisión con ID ${classGroupId} no encontrada`);
    }

    // Validar que la comisión esté activa
    if (!classGroup.isActive) {
      throw new BadRequestException('No se puede registrar asistencia en una comisión inactiva');
    }

    // Verificar permisos explícitos
    if (role === Role.TEACHER) {
      const teacher = await this.prisma.teacher.findUnique({
        where: { userId: actorUserId },
      });

      if (!teacher || classGroup.teacherId !== teacher.id) {
        throw new ForbiddenException('No tienes permiso para registrar asistencia en esta comisión');
      }
    }

    // Verificar que todos los alumnos pertenecen a la comisión
    const validStudents = await this.prisma.student.findMany({
      where: {
        id: { in: studentIds },
        classGroupId: classGroupId,
        deletedAt: null,
      },
    });

    if (validStudents.length !== studentIds.length) {
      throw new BadRequestException('Uno o más alumnos no pertenecen a esta comisión o no existen');
    }

    // Registrar asistencia (usando upsert para cada registro en una transacción)
    const results = await this.prisma.$transaction(
      records.map((record) =>
        this.prisma.attendance.upsert({
          where: {
            studentId_date: {
              studentId: record.studentId,
              date: attendanceDate,
            },
          },
          update: {
            present: record.present,
            classGroupId: classGroupId,
          },
          create: {
            studentId: record.studentId,
            classGroupId: classGroupId,
            date: attendanceDate,
            present: record.present,
          },
        }),
      ),
    );

    return {
      message: 'Asistencia registrada correctamente',
      count: results.length,
      date: attendanceDate.toISOString().split('T')[0],
    };
  }

  async findAll(query: AttendanceQueryDto, actorUserId?: number, role?: Role) {
    const { classGroupId, studentId, date, startDate, endDate, month, year } = query;

    // Validación estricta de mes/año
    if (month !== undefined && year === undefined) {
      throw new BadRequestException('El filtro por mes requiere que también se especifique el año');
    }

    const where: Prisma.AttendanceWhereInput = {};

    if (classGroupId) where.classGroupId = classGroupId;
    if (studentId) where.studentId = studentId;

    if (date) {
      where.date = this.normalizeAttendanceDate(date);
    } else if (year !== undefined) {
      const startYear = year;
      const startMonth = month ? month - 1 : 0;
      const endMonth = month ? month : 12;

      const start = new Date(Date.UTC(startYear, startMonth, 1));
      const end = new Date(Date.UTC(startYear, endMonth, 0, 23, 59, 59, 999));

      where.date = {
        gte: start,
        lte: end,
      };
    } else if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = this.startOfDayUTC(startDate);
      }
      if (endDate) {
        where.date.lte = this.endOfDayUTC(endDate);
      }
    }

    // Si es profesor, solo puede ver asistencia de sus comisiones o sus alumnos
    if (role === Role.TEACHER && actorUserId) {
      const teacher = await this.prisma.teacher.findUnique({
        where: { userId: actorUserId },
      });
      if (teacher) {
        where.classGroup = { teacherId: teacher.id };
      }
    }

    // Si es alumno, solo puede ver su propia asistencia
    if (role === Role.STUDENT && actorUserId) {
      const student = await this.prisma.student.findUnique({
        where: { userId: actorUserId },
      });
      if (student) {
        where.studentId = student.id;
      } else {
        return []; // No debería pasar si el usuario es alumno
      }
    }

    return this.prisma.attendance.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        classGroup: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  async getAttendanceByClassAndDate(classGroupId: number, date: string) {
    const d = this.normalizeAttendanceDate(date);

    return this.prisma.attendance.findMany({
      where: {
        classGroupId,
        date: d,
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }
}

