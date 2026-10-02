import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
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
      throw new NotFoundException(
        'No se ha configurado ningún evento del mes aún.',
      );
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
      // Manejar reemplazo o eliminación de imagen cuadrada
      let squareUrl = existingEvent.imageUrlSquare;
      if (dto.removeSquare === 'true' && !dto.imageUrlSquare) {
        if (squareUrl) {
          const publicId = this.cloudinaryService.extractPublicId(squareUrl);
          if (publicId) await this.cloudinaryService.deleteFile(publicId).catch(() => {});
        }
        squareUrl = null;
      } else if (dto.imageUrlSquare) {
        if (squareUrl && squareUrl !== dto.imageUrlSquare) {
          const publicId = this.cloudinaryService.extractPublicId(squareUrl);
          if (publicId) await this.cloudinaryService.deleteFile(publicId).catch(() => {});
        }
        squareUrl = dto.imageUrlSquare;
      }

      // Manejar reemplazo o eliminación de imagen vertical
      let verticalUrl = existingEvent.imageUrlVertical;
      if (dto.removeVertical === 'true' && !dto.imageUrlVertical) {
        if (verticalUrl) {
          const publicId = this.cloudinaryService.extractPublicId(verticalUrl);
          if (publicId) await this.cloudinaryService.deleteFile(publicId).catch(() => {});
        }
        verticalUrl = null;
      } else if (dto.imageUrlVertical) {
        if (verticalUrl && verticalUrl !== dto.imageUrlVertical) {
          const publicId = this.cloudinaryService.extractPublicId(verticalUrl);
          if (publicId) await this.cloudinaryService.deleteFile(publicId).catch(() => {});
        }
        verticalUrl = dto.imageUrlVertical;
      }

      // Manejar reemplazo o eliminación de imagen horizontal / banner
      let bannerUrl = existingEvent.imageUrlBanner;
      if (dto.removeBanner === 'true' && !dto.imageUrlBanner) {
        if (bannerUrl) {
          const publicId = this.cloudinaryService.extractPublicId(bannerUrl);
          if (publicId) await this.cloudinaryService.deleteFile(publicId).catch(() => {});
        }
        bannerUrl = null;
      } else if (dto.imageUrlBanner) {
        if (bannerUrl && bannerUrl !== dto.imageUrlBanner) {
          const publicId = this.cloudinaryService.extractPublicId(bannerUrl);
          if (publicId) await this.cloudinaryService.deleteFile(publicId).catch(() => {});
        }
        bannerUrl = dto.imageUrlBanner;
      }

      // Manejo de compatibilidad con imageUrl clásica
      let legacyUrl = existingEvent.imageUrl;
      if (dto.imageUrl) {
        if (legacyUrl && legacyUrl !== dto.imageUrl) {
          const publicId = this.cloudinaryService.extractPublicId(legacyUrl);
          if (publicId) await this.cloudinaryService.deleteFile(publicId).catch(() => {});
        }
        legacyUrl = dto.imageUrl;
      } else {
        legacyUrl = bannerUrl || squareUrl || verticalUrl || legacyUrl;
      }

      // Validar que al menos una imagen siga existiendo
      if (!bannerUrl && !squareUrl && !verticalUrl && !legacyUrl) {
        throw new BadRequestException(
          'El evento debe tener al menos una imagen (cuadrada, vertical o horizontal).',
        );
      }

      return this.prisma.event.update({
        where: { id: existingEvent.id },
        data: {
          title: dto.title,
          imageUrl: legacyUrl,
          imageUrlSquare: squareUrl,
          imageUrlVertical: verticalUrl,
          imageUrlBanner: bannerUrl,
        },
      });
    }

    // Creación de nuevo evento
    const legacyUrl =
      dto.imageUrlBanner ||
      dto.imageUrlSquare ||
      dto.imageUrlVertical ||
      dto.imageUrl;

    if (!legacyUrl) {
      throw new BadRequestException(
        'Se requiere al menos una imagen (cuadrada, vertical o horizontal) para crear el evento.',
      );
    }

    return this.prisma.event.create({
      data: {
        title: dto.title,
        imageUrl: legacyUrl,
        imageUrlSquare: dto.imageUrlSquare || null,
        imageUrlVertical: dto.imageUrlVertical || null,
        imageUrlBanner: dto.imageUrlBanner || null,
      },
    });
  }

  /**
   * Elimina el evento del mes de la base de datos y todas sus imágenes en Cloudinary.
   */
  async removeEvent() {
    const existingEvent = await this.prisma.event.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    if (!existingEvent) {
      throw new NotFoundException(
        'No hay ningún evento activo del mes para eliminar.',
      );
    }

    const imagesToDelete = [
      existingEvent.imageUrl,
      existingEvent.imageUrlSquare,
      existingEvent.imageUrlVertical,
      existingEvent.imageUrlBanner,
    ].filter(Boolean) as string[];

    const publicIds = Array.from(
      new Set(
        imagesToDelete
          .map((url) => this.cloudinaryService.extractPublicId(url))
          .filter(Boolean),
      ),
    );

    for (const pid of publicIds) {
      await this.cloudinaryService.deleteFile(pid).catch(() => {});
    }

    await this.prisma.event.delete({
      where: { id: existingEvent.id },
    });

    return {
      success: true,
      message: 'Evento del mes y sus imágenes eliminados correctamente',
    };
  }
}
