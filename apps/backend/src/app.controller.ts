import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class AppController {

  @Get()
  @ApiOperation({ summary: 'Vérifier que l’API répond' })
  @ApiOkResponse({
    description: 'L’API est disponible. Ce endpoint ne vérifie pas la base de données.',
    schema: {
      type: 'object',
      required: ['status'],
      properties: { status: { type: 'string', enum: ['ok'], example: 'ok' } },
    },
  })
  health(): { status: 'ok' } {
    return { status: 'ok' };
  }
}
