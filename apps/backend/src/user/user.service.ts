import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  // GET /api/users (avec pagination et filtres)
  async findAll(query: {
    page?: number;
    limit?: number;
    email?: string;
    username?: string;
  }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.email) {
      where.email = { contains: query.email, mode: 'insensitive' };
    }
    if (query.username) {
      where.username = { contains: query.username, mode: 'insensitive' };
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // GET /api/users/:id
  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${id} introuvable`);
    }
    return user;
  }

  // PUT /api/users/:id
  async update(id: string, data: { email?: string; username?: string }) {
    await this.findOne(id); // Vérifie l'existence
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  // DELETE /api/users/:id
  async remove(id: string) {
    await this.findOne(id); // Vérifie l'existence
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
