// import { Injectable, Logger } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { InjectRedis } from '@nestjs-modules/ioredis';
// import Redis from 'ioredis';
// import axios from 'axios';
// import {
//     WeatherResponseDto,
//     ForecastResponseDto,
//     LocationDto,
// } from '../dtos/weather.dto';

// @Injectable()
// export class WeatherService {
//     private readonly logger = new Logger(WeatherService.name);
//     private readonly apiKey: string;
//     private readonly baseUrl = 'http://api.weatherapi.com/v1';
//     private readonly cacheTTL = 1800; // 30 minutes

//     constructor(
//         private readonly configService: ConfigService,
//         @InjectRedis() private readonly redis: Redis
//     ) {
//         this.apiKey =
//             this.configService.get<string>('WEATHER_API_KEY') ??
//             '0c10d0ad4eb349819de171251253004';
//     }

//     private getCacheKey(type: string, location: string): string {
//         return `weather:${type}:${location.toLowerCase()}`;
//     }

//     async getCurrentWeather(location: string): Promise<WeatherResponseDto> {
//         const cacheKey = this.getCacheKey('current', location);
//         const cachedData = await this.redis.get(cacheKey);

//         if (cachedData) {
//             return JSON.parse(cachedData);
//         }

//         try {
//             const response = await axios.get(`${this.baseUrl}/current.json`, {
//                 params: {
//                     key: this.apiKey,
//                     q: location,
//                     aqi: 'no',
//                 },
//             });

//             const { location: loc, current } = response.data;
//             const weatherData: WeatherResponseDto = {
//                 location: loc.name,
//                 temperature: current.temp_c,
//                 feelsLike: current.feelslike_c,
//                 condition: current.condition.text,
//                 humidity: current.humidity,
//                 windSpeed: current.wind_kph,
//                 pressure: current.pressure_mb,
//                 uv: current.uv,
//                 sunrise: loc.localtime.split(' ')[1],
//                 sunset: loc.localtime.split(' ')[1], // Note: WeatherAPI free tier doesn't provide sunrise/sunset
//             };

//             await this.redis.setex(
//                 cacheKey,
//                 this.cacheTTL,
//                 JSON.stringify(weatherData)
//             );
//             return weatherData;
//         } catch (error) {
//             this.logger.error(
//                 `Error fetching current weather for ${location}:`,
//                 error
//             );
//             throw error;
//         }
//     }

//     async getForecast(location: string): Promise<ForecastResponseDto> {
//         const cacheKey = this.getCacheKey('forecast', location);
//         const cachedData = await this.redis.get(cacheKey);

//         if (cachedData) {
//             return JSON.parse(cachedData);
//         }

//         try {
//             const response = await axios.get(`${this.baseUrl}/forecast.json`, {
//                 params: {
//                     key: this.apiKey,
//                     q: location,
//                     days: 5,
//                     aqi: 'no',
//                 },
//             });

//             const { forecast } = response.data;
//             const forecastData: ForecastResponseDto = {
//                 daily: forecast.forecastday.map(day => ({
//                     date: day.date,
//                     temperature: day.day.avgtemp_c,
//                     condition: day.day.condition.text,
//                 })),
//                 hourly: forecast.forecastday[0].hour.map(hour => ({
//                     time: hour.time.split(' ')[1],
//                     temperature: hour.temp_c,
//                     condition: hour.condition.text,
//                     windSpeed: hour.wind_kph,
//                 })),
//             };

//             await this.redis.setex(
//                 cacheKey,
//                 this.cacheTTL,
//                 JSON.stringify(forecastData)
//             );
//             return forecastData;
//         } catch (error) {
//             this.logger.error(
//                 `Error fetching forecast for ${location}:`,
//                 error
//             );
//             throw error;
//         }
//     }

//     // Optional: Methods for managing favorite locations
//     private readonly locationsCacheKey = 'weather:locations';

//     async saveLocation(location: LocationDto): Promise<LocationDto> {
//         const locations = await this.getLocations();
//         locations.push(location);
//         await this.redis.set(this.locationsCacheKey, JSON.stringify(locations));
//         return location;
//     }

//     async getLocations(): Promise<LocationDto[]> {
//         const locations = await this.redis.get(this.locationsCacheKey);
//         return locations ? JSON.parse(locations) : [];
//     }

//     async deleteLocation(id: string): Promise<boolean> {
//         const locations = await this.getLocations();
//         const filteredLocations = locations.filter(loc => loc.id !== id);
//         await this.redis.set(
//             this.locationsCacheKey,
//             JSON.stringify(filteredLocations)
//         );
//         return true;
//     }
// }
