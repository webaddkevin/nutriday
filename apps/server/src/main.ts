import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // 全局响应转换
  app.useGlobalInterceptors(new TransformInterceptor());

  // 全局异常过滤
  app.useGlobalFilters(new AllExceptionsFilter());

  // CORS
  app.enableCors();

  await app.listen(process.env.PORT ?? 3002);
  console.log(
    `🚀 Server running on http://localhost:${process.env.PORT ?? 3002}`,
  );
}
bootstrap();
