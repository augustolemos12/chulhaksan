import {
  Controller,
  Post,
  Body,
  Res,
  Get,
  UseGuards,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import type { Response } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { Role } from '@prisma/client';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { token, expiresIn, user } = await this.authService.login(loginDto);

    response.cookie('Authentication', token, {
      httpOnly: true,
      path: '/',
      maxAge: expiresIn * 1000,
      sameSite: 'strict',
      // secure: process.env.NODE_ENV === 'production', // uncomment in prod
    });

    return { message: 'Login exitoso', user, token };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('Authentication', {
      httpOnly: true,
      path: '/',
      sameSite: 'strict',
      // secure: process.env.NODE_ENV === 'production',
    });
    return { message: 'Logout exitoso' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@CurrentUser() user: any) {
    return user;
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @CurrentUser() user: any,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(user.id, changePasswordDto);
  }

  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  async refresh(
    @CurrentUser() user: any,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { token, expiresIn } = await this.authService.refreshToken(user.id);

    response.cookie('Authentication', token, {
      httpOnly: true,
      path: '/',
      maxAge: expiresIn * 1000,
      sameSite: 'strict',
      // secure: process.env.NODE_ENV === 'production',
    });

    return { message: 'Sesión renovada', token };
  }

  @Post('admin/users/:id/reset-password')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async resetAdminPassword(@Param('id', ParseIntPipe) id: number) {
    return this.authService.resetAdminPassword(id);
  }
}
