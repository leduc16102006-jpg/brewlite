import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

declare const process: {
  env: Record<string, string | undefined>;
};

async function bootstrap() {
  // Work around the duplicated NestJS dependency/type mismatch between workspace root and backend.
  const app = (await NestFactory.create(AppModule)) as any;

  // ✅ 1. Bật CORS cho Next.js (http://localhost:3001) gọi API không bị chặn
  app.enableCors({
    origin: ['http://localhost:3001', 'http://127.0.0.1:3001'],
    credentials: true,
  });

  // ✅ 2. ValidationPipe toàn cục — BẮT BUỘC theo đề bài
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // ✅ 3. Swagger — xem & test API trực tiếp
  const config = new DocumentBuilder()
    .setTitle('API Dự Án Brewlite')
    .setDescription('Tài liệu API cho nhóm — Menu & Sản phẩm')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`✅ Backend chạy tại: http://localhost:${port}`);
  console.log(`✅ Tài liệu Swagger: http://localhost:${port}/api/docs`);
}
bootstrap();