
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Task 2: Cho phép Next.js Frontend gọi Backend
  app.enableCors({
    origin: [
      'http://localhost:3001',
      'http://127.0.0.1:3001',
    ],
    credentials: true,
  });

  // Task 7: Kiểm tra dữ liệu đầu vào
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger chung cho Products API và Authentication API
  const swaggerConfig = new DocumentBuilder()
    .setTitle('BrewLite API')
    .setDescription(
      'API documentation for BrewLite coffee ordering system',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(
    app,
    swaggerConfig,
  );

  SwaggerModule.setup('api/docs', app, document);

  const port = Number(process.env.PORT ?? 3000);

  await app.listen(port);

  console.log(`Backend: http://localhost:${port}`);
  console.log(`Swagger: http://localhost:${port}/api/docs`);
}

void bootstrap();
