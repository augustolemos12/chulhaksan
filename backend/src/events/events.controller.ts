import { Controller, Get, Post, Delete, Body, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { ApiBearerAuth, ApiCookieAuth, ApiOperation, ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@ApiTags('Events (Event of the month)')
@ApiCookieAuth()
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('events')
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Get()
  @Roles(Role.ADMIN, Role.TEACHER, Role.STUDENT)
  @ApiOperation({ summary: 'Obtener el evento del mes activo' })
  findOne() {
    return this.eventsService.getEvent();
  }

  @Post()
  @Roles(Role.ADMIN)
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Crear o actualizar (upsert) el evento del mes con imagen' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Título del evento' },
        image: {
          type: 'string',
          format: 'binary',
          description: 'Imagen del evento',
        },
      },
    },
  })
  async upsert(
    @Body() createEventDto: CreateEventDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      const uploadResult = await this.cloudinaryService.uploadFile(file);
      createEventDto.imageUrl = uploadResult.secure_url;
    } else if (!createEventDto.imageUrl) {
      // Si no hay archivo y tampoco hay imageUrl proporcionada explícitamente y no hay evento previo, 
      // upsertEvent podría fallar si se requiere. La base de datos requiere imageUrl, 
      // así que delegamos en class-validator o Prisma el error si es la primera creación.
    }
    
    return this.eventsService.upsertEvent(createEventDto);
  }

  @Delete()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Eliminar el evento del mes' })
  remove() {
    return this.eventsService.removeEvent();
  }
}
