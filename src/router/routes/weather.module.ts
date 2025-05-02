import { Module } from '@nestjs/common';
import { WeatherController } from 'src/modules/weather/controllers/weather.controller';
import { WeatherModule } from 'src/modules/weather/weather.module';

@Module({
    controllers: [WeatherController],
    providers: [],
    exports: [],
    imports: [WeatherModule],
})
export class RoutesWeatherModule {}
