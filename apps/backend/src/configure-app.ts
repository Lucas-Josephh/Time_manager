import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function configureApp(app: INestApplication): void {
  app.setGlobalPrefix('api');
  app.enableShutdownHooks();

  // Documente les contrôleurs NestJS.
  const config = new DocumentBuilder()
    .setTitle('Time Manager API')
    .setDescription('Documentation des endpoints de l’API Time Manager.')
    .setVersion('0.0.0')
    .build();

  SwaggerModule.setup(
    'api/docs',
    app,
    () => SwaggerModule.createDocument(app, config),
    {
      jsonDocumentUrl: 'api/docs-json',
      yamlDocumentUrl: 'api/docs-yaml',
      customSiteTitle: 'Time Manager — API',
    },
  );
}
