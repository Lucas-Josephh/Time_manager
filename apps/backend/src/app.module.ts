import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { AppController } from './app.controller.js';
import { PrismaModule } from './prisma/prisma.module.js';

const currentDirectory = dirname(fileURLToPath(import.meta.url));

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: resolve(currentDirectory, '../../../.env'),
    }),
    PrismaModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
