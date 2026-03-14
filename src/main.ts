import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { join } from 'path';
import * as hbs from 'hbs';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const hbsModule = require('hbs');
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Template engine setup
  app.setViewEngine('hbs');
  app.setBaseViewsDir(join(process.cwd(), 'views'));
  app.useStaticAssets(join(process.cwd(), 'public'));

  // Register Handlebars partials
  hbsModule.registerPartials(join(process.cwd(), 'views', 'partials'));

  // Register Handlebars helpers
  hbsModule.registerHelper('eq', (a, b) => a === b);
  hbsModule.registerHelper('formatNumber', (num) => {
    return new Intl.NumberFormat('vi-VN').format(num || 0);
  });
  hbsModule.registerHelper('formatDate', (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('vi-VN');
  });
  hbsModule.registerHelper('json', (obj) => JSON.stringify(obj));

  // Global prefix for API only
  // Note: We DON'T set global prefix here because views need root paths
  // API routes are prefixed in their controllers instead

  // CORS
  app.enableCors();

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global filters & interceptors
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Personal Finance Tracker API')
    .setDescription('API documentation for Personal Finance Tracker')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Users', 'User profile management')
    .addTag('Categories', 'Income/Expense categories')
    .addTag('Transactions', 'Financial transactions')
    .addTag('Budgets', 'Budget management')
    .addTag('Analytics', 'Financial reports & statistics')
    .addTag('Notifications', 'Budget alerts & notifications')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
}

bootstrap();
