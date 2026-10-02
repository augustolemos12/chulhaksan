import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiTags,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

/** Tamaño máximo permitido por imagen: 5 MB */
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
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'imageSquare', maxCount: 1 },
        { name: 'imageVertical', maxCount: 1 },
        { name: 'imageBanner', maxCount: 1 },
        { name: 'image', maxCount: 1 }, // compatibilidad con clientes existentes
      ],
      { storage: memoryStorage() },
    ),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Crear o actualizar el evento del mes con hasta 3 imágenes responsivas',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['title'],
      properties: {
        title: {
          type: 'string',
          description: 'Título del evento (2–200 caracteres)',
          example: 'Torneo Nacional de Taekwon-Do',
        },
        imageSquare: {
          type: 'string',
          format: 'binary',
          description: 'Imagen cuadrada (1:1) — máx. 5 MB',
        },
        imageVertical: {
          type: 'string',
          format: 'binary',
          description: 'Imagen vertical (9:16) — máx. 5 MB',
        },
        imageBanner: {
          type: 'string',
          format: 'binary',
          description: 'Imagen horizontal / banner — máx. 5 MB',
        },
        removeSquare: {
          type: 'string',
          description: '"true" para eliminar la imagen cuadrada existente',
        },
        removeVertical: {
          type: 'string',
          description: '"true" para eliminar la imagen vertical existente',
        },
        removeBanner: {
          type: 'string',
          description: '"true" para eliminar la imagen horizontal existente',
        },
      },
    },
  })
  async upsert(
    @Body() createEventDto: CreateEventDto,
    @UploadedFiles()
    files: {
      imageSquare?: Express.Multer.File[];
      imageVertical?: Express.Multer.File[];
      imageBanner?: Express.Multer.File[];
      image?: Express.Multer.File[];
    },
  ) {
    const uploadedList = [
      files?.imageSquare?.[0],
      files?.imageVertical?.[0],
      files?.imageBanner?.[0],
      files?.image?.[0],
    ].filter(Boolean) as Express.Multer.File[];

    for (const f of uploadedList) {
      if (f.size > MAX_FILE_SIZE) {
        throw new BadRequestException(
          `El archivo "${f.originalname}" supera el tamaño máximo permitido de 5 MB.`,
        );
      }
      if (!ALLOWED_MIME_TYPES.test(f.mimetype)) {
        throw new BadRequestException(
          `El archivo "${f.originalname}" tiene un formato no válido. Solo se permiten JPG, PNG o WebP.`,
        );
      }
    }

    if (files?.imageSquare?.[0]) {
      const res = await this.cloudinaryService.uploadFile(files.imageSquare[0]);
      createEventDto.imageUrlSquare = res.secure_url;
    }

    if (files?.imageVertical?.[0]) {
      const res = await this.cloudinaryService.uploadFile(files.imageVertical[0]);
      createEventDto.imageUrlVertical = res.secure_url;
    }

    if (files?.imageBanner?.[0]) {
      const res = await this.cloudinaryService.uploadFile(files.imageBanner[0]);
      createEventDto.imageUrlBanner = res.secure_url;
    }

    if (files?.image?.[0]) {
      const res = await this.cloudinaryService.uploadFile(files.image[0]);
      createEventDto.imageUrl = res.secure_url;
    }

    return this.eventsService.upsertEvent(createEventDto);
  }

  // ─── DELETE ─────────────────────────────────────────────────────────────────

  @Delete()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Eliminar el evento del mes y su imagen en Cloudinary',
  })
  remove() {
    return this.eventsService.removeEvent();
  }
}
