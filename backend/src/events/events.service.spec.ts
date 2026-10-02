import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('EventsService', () => {
  let service: EventsService;
  let prisma: {
    event: {
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };
  let cloudinary: {
    uploadFile: jest.Mock;
    deleteFile: jest.Mock;
    extractPublicId: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      event: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    cloudinary = {
      uploadFile: jest.fn(),
      deleteFile: jest.fn().mockResolvedValue({ result: 'ok' }),
      extractPublicId: jest.fn().mockReturnValue('sample_id'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        { provide: PrismaService, useValue: prisma },
        { provide: CloudinaryService, useValue: cloudinary },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getEvent', () => {
    it('throws NotFoundException when no event exists', async () => {
      prisma.event.findFirst.mockResolvedValue(null);
      await expect(service.getEvent()).rejects.toThrow(NotFoundException);
    });

    it('returns event when found', async () => {
      const mockEvent = { id: 1, title: 'Evento Test' };
      prisma.event.findFirst.mockResolvedValue(mockEvent);
      const result = await service.getEvent();
      expect(result).toBe(mockEvent);
    });
  });

  describe('upsertEvent', () => {
    it('creates new event when none exists and at least one image provided', async () => {
      prisma.event.findFirst.mockResolvedValue(null);
      prisma.event.create.mockResolvedValue({ id: 1, title: 'Nuevo', imageUrlBanner: 'banner.jpg' });

      const res = await service.upsertEvent({
        title: 'Nuevo',
        imageUrlBanner: 'banner.jpg',
      });

      expect(prisma.event.create).toHaveBeenCalledWith({
        data: {
          title: 'Nuevo',
          imageUrl: 'banner.jpg',
          imageUrlSquare: null,
          imageUrlVertical: null,
          imageUrlBanner: 'banner.jpg',
        },
      });
      expect(res.id).toBe(1);
    });

    it('throws BadRequestException if creating new event with 0 images', async () => {
      prisma.event.findFirst.mockResolvedValue(null);
      await expect(service.upsertEvent({ title: 'Sin imagen' })).rejects.toThrow(BadRequestException);
    });

    it('updates existing event and allows partial images', async () => {
      const existing = {
        id: 1,
        title: 'Viejo',
        imageUrl: 'old.jpg',
        imageUrlSquare: 'old_square.jpg',
        imageUrlVertical: null,
        imageUrlBanner: null,
      };
      prisma.event.findFirst.mockResolvedValue(existing);
      prisma.event.update.mockResolvedValue({ ...existing, title: 'Actualizado' });

      await service.upsertEvent({
        title: 'Actualizado',
        imageUrlVertical: 'new_vertical.jpg',
      });

      expect(prisma.event.update).toHaveBeenCalled();
    });
  });

  describe('removeEvent', () => {
    it('removes event and deletes images from Cloudinary', async () => {
      prisma.event.findFirst.mockResolvedValue({
        id: 1,
        title: 'A borrar',
        imageUrl: 'http://res.cloudinary.com/demo/image/upload/v1/legacy.jpg',
        imageUrlSquare: 'http://res.cloudinary.com/demo/image/upload/v1/sq.jpg',
        imageUrlVertical: null,
        imageUrlBanner: null,
      });
      prisma.event.delete.mockResolvedValue({ id: 1 });

      const res = await service.removeEvent();
      expect(res.success).toBe(true);
      expect(cloudinary.deleteFile).toHaveBeenCalled();
      expect(prisma.event.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });
});
