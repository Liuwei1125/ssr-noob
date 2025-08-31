import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // 配置视图引擎
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('ejs');
  
  // 配置静态文件目录
  app.use(express.static(join(__dirname, '..', 'public')));
  
  // 启动服务器
  await app.listen(3000);
  console.log(`应用已启动，访问 http://localhost:3000`);
}
bootstrap();