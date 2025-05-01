// import {
//     Controller,
//     Get,
//     Post,
//     Delete,
//     Query,
//     Body,
//     Param,
// } from '@nestjs/common';
// import { WeatherService } from '../services/weather.service';
// import {
//     WeatherResponseDto,
//     ForecastResponseDto,
//     LocationDto,
// } from '../dtos/weather.dto';

// @Controller('weather')
// export class WeatherController {
//     constructor(private readonly weatherService: WeatherService) {}

//     @Get()
//     async getCurrentWeather(
//         @Query('location') location: string
//     ): Promise<WeatherResponseDto> {
//         return this.weatherService.getCurrentWeather(location);
//     }

//     @Get('forecast')
//     async getForecast(
//         @Query('location') location: string
//     ): Promise<ForecastResponseDto> {
//         return this.weatherService.getForecast(location);
//     }

//     @Get('locations')
//     async getLocations(): Promise<LocationDto[]> {
//         return this.weatherService.getLocations();
//     }

//     @Post('locations')
//     async saveLocation(@Body() location: LocationDto): Promise<LocationDto> {
//         return this.weatherService.saveLocation(location);
//     }

//     @Delete('locations/:id')
//     async deleteLocation(@Param('id') id: string): Promise<boolean> {
//         return this.weatherService.deleteLocation(id);
//     }
// }
