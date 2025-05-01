import { Module } from '@nestjs/common';
// import { WeatherController } from './controllers/weather.controller';
// import { WeatherService } from './services/weather.service';
// import { RedisModule } from '@nestjs-modules/ioredis';
// import { ConfigService } from '@nestjs/config';

@Module({
    // imports: [
    //     RedisModule.forRootAsync({
    //         useFactory: (configService: ConfigService) => ({
    //             config: {
    //                 url: configService.get('REDIS_URL'),
    //             },
    //         }),
    //         inject: [ConfigService],
    //     }),
    // ],
    // controllers: [WeatherController],
    // providers: [WeatherService],
    // exports: [WeatherService],
})
export class WeatherModule {}
