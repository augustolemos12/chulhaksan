import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto) {
    const { dni, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { dni },
    });

    if (!user || user.status === 'BLOCKED') {
      throw new UnauthorizedException('Credenciales inválidas o usuario bloqueado');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = { sub: user.id, role: user.role };
    const token = this.jwtService.sign(payload);

    const expiresIn = Number(this.configService.get('JWT_EXPIRATION_TIME')) || 86400;

    return {
      token,
      expiresIn,
      user: {
        id: user.id,
        dni: user.dni,
        role: user.role,
        mustChangePassword: user.mustChangePassword
      }
    };
  }

  async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
    const { newPassword } = changePasswordDto;
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        mustChangePassword: false,
      },
    });

    return { message: 'Contraseña actualizada correctamente' };
  }

  async resetAdminPassword(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const temporaryPassword = '123456';
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        mustChangePassword: true,
      },
    });

    return { temporaryPassword };
  }

  async refreshToken(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.status === 'BLOCKED') {
      throw new UnauthorizedException('Usuario no válido o bloqueado');
    }

    const payload = { sub: user.id, role: user.role };
    const token = this.jwtService.sign(payload);
    const expiresIn = Number(this.configService.get('JWT_EXPIRATION_TIME')) || 86400;

    return {
      token,
      expiresIn,
    };
  }
}
