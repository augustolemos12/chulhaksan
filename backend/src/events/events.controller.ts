import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiTags,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

/** Tamaño máximo permitido: 5 MB */
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/** Tipos MIME aceptados */
const ALLOWED_MIME_TYPES = /^image\/(jpeg|png|webp)$/;

@ApiTags('Events (Event of the month)')
@ApiCookieAuth()
@ApiBearerAuth()
@Controller('events')
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // ─── GET ────────────────────────────────────────────────────────────────────

  @Get()
  @Roles(Role.ADMIN, Role.TEACHER, Role.STUDENT)
  @ApiOperation({ summary: 'Obtener el evento del mes activo' })
  findOne() {
    return this.eventsService.getEvent();
  }

  // ─── POST ───────────────────────────────────────────────────────────────────

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @UseInterceptors(FileInterceptor('image', { storage: memoryStorage() }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Crear o actualizar el evento del mes (requiere imagen)' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['title', 'image'],
      properties: {
        title: {
          type: 'string',
          description: 'Título del evento (2–200 caracteres)',
          example: 'Examen de Cinturones de Mayo',
        },
        image: {
          type: 'string',
          format: 'binary',
          description: 'Imagen del evento (jpg, jpeg, png o webp — máx. 5 MB)',
        },
      },
    },
  })
  async upsert(
    @Body() createEventDto: CreateEventDto,
    @UploadedFile(
      new ParseFilePipe({
        // fileIsRequired lanza 400 automáticamente si no se adjunta ningún archivo
        fileIsRequired: true,
        validators: [
          // Rechaza archivos mayores a 5 MB
          new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE }),
          // Permite únicamente jpg/jpeg, png y webp
          new FileTypeValidator({ fileType: ALLOWED_MIME_TYPES }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const uploadResult = await this.cloudinaryService.uploadFile(file);
    createEventDto.imageUrl = uploadResult.secure_url;
    return this.eventsService.upsertEvent(createEventDto);
  }

  // ─── DELETE ─────────────────────────────────────────────────────────────────

  @Delete()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Eliminar el evento del mes y su imagen en Cloudinary' })
  remove() {
    return this.eventsService.removeEvent();
  }
}
