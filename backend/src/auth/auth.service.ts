import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';

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
}
