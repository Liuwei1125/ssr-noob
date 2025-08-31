import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 添加CORS配置，允许前端React应用访问API
  app.enableCors({
    origin: '*', // 允许所有来源访问，在生产环境中应配置具体的前端域名
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
