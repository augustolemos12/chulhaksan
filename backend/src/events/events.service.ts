import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateEventDto } from './dto/create-event.dto';

@Injectable()
export class EventsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  /**
   * Obtiene el único evento del mes configurado.
   * Lanza un NotFoundException si no existe.
   */
  async getEvent() {
    const event = await this.prisma.event.findFirst({
      orderBy: { createdAt: 'desc' },
    });
    if (!event) {
      throw new NotFoundException('No se ha configurado ningún evento del mes aún.');
    }
    return event;
  }

  /**
   * Crea el evento del mes o lo actualiza si ya existe uno.
   * Patrón singleton en base de datos.
   */
  async upsertEvent(dto: CreateEventDto) {
    const existingEvent = await this.prisma.event.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    if (existingEvent) {
      return this.prisma.event.update({
        where: { id: existingEvent.id },
        data: {
          title: dto.title,
          imageUrl: dto.imageUrl,
        },
      });
    }

    if (!dto.imageUrl) {
      throw new BadRequestException('Se requiere una imagen para crear el evento por primera vez.');
    }

    return this.prisma.event.create({
      data: {
        title: dto.title,
        imageUrl: dto.imageUrl,
      },
    });
  }

  /**
   * Elimina el evento del mes de la base de datos y su imagen en Cloudinary.
   */
  async removeEvent() {
    const existingEvent = await this.prisma.event.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    if (!existingEvent) {
      throw new NotFoundException('No hay ningún evento activo del mes para eliminar.');
    }

    // Eliminar la imagen de Cloudinary si existe
    if (existingEvent.imageUrl) {
      const publicId = this.cloudinaryService.extractPublicId(existingEvent.imageUrl);
      if (publicId) {
        await this.cloudinaryService.deleteFile(publicId);
      }
    }

    await this.prisma.event.delete({
      where: { id: existingEvent.id },
    });

    return { success: true, message: 'Evento del mes y su imagen eliminados correctamente' };
  }
}
