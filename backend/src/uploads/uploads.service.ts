import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UploadsService {
  constructor(private prisma: PrismaService) {}

  async saveFileRecord(userId: string, data: { name: string; path: string; mimeType: string; size: number }) {
    return this.prisma.file.create({
      data: {
        name: data.name,
        path: data.path,
        mimeType: data.mimeType,
        size: data.size,
        userId,
      },
    });
  }
}
