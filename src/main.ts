if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('ITMO.SANTA API')
    .setDescription(
      'Backend API description. Used by client-side and telegram-bot.',
    )
    .setVersion('0.1')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);
  await app.listen(3030);
}
bootstrap();
