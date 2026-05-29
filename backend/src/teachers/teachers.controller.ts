import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { TeacherQueryDto } from './dto/teacher-query.dto';
import { UpdateTeacherPaymentDto } from './dto/update-teacher-payment.dto';
import { ApiCookieAuth, ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

@ApiTags('Teachers')
@ApiCookieAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('teachers')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  // ==========================================
  // ENDPOINTS PROFESORES (TEACHER)
  // ==========================================

  @Get('me')
  @Roles(Role.TEACHER)
  findOwnProfile(@CurrentUser() user: any) {
    return this.teachersService.findOwnProfile(user.id);
  }

  @Patch('me/payment-info')
  @Roles(Role.TEACHER)
  @UseInterceptors(FileInterceptor('qrCode', { storage: memoryStorage() }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        walletUrl: {
          type: 'string',
          description: 'URL de redirección a la billetera virtual',
          example: 'https://link.mercadopago.com.ar/ejemplo',
        },
        qrCode: {
          type: 'string',
          format: 'binary',
          description: 'Imagen del código QR (jpg, jpeg, png o webp — máx. 5 MB)',
        },
      },
    },
  })
  async updateOwnPaymentDetails(
    @CurrentUser() user: any,
    @Body() dto: UpdateTeacherPaymentDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /^image\/(jpeg|png|webp)$/ }),
        ],
      }),
    ) file?: Express.Multer.File,
  ) {
    return this.teachersService.updateOwnPaymentDetails(user.id, dto, file);
  }

  // ==========================================
  // ENDPOINTS ADMINISTRACIÓN (ADMIN)
  // ==========================================

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() createTeacherDto: CreateTeacherDto) {
    return this.teachersService.create(createTeacherDto);
  }

  @Get()
  @Roles(Role.ADMIN)
  findAll(@Query() query: TeacherQueryDto) {
    return this.teachersService.findAll(query);
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.teachersService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTeacherDto: UpdateTeacherDto,
  ) {
    return this.teachersService.update(id, updateTeacherDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.teachersService.remove(id);
  }
}


