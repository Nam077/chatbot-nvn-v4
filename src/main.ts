import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { getBotToken } from 'nestjs-telegraf';
async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.enableCors();
    const config = new DocumentBuilder()
        .setTitle('ChatBotNVN API')
        .setDescription('The ChatBotNVN API description')
        .setVersion('1.0')
        .addTag('ChatBotNVN')
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
    console.clear();
    // const bot = app.get(getBotToken());
    // app.use(bot.webhookCallback('/telegraf'));
    await app.listen(3000);
}
bootstrap().then(() => console.log('Application is running on: http://localhost:3000'));
