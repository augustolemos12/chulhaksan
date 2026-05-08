import { Controller, Post, Body, Res, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import type { Response } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) response: Response) {
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
}
