import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { ForecastResponse } from 'src/modules/weather/interfaces/forecast.interface';
import { SearchResult } from 'src/modules/weather/interfaces/search.interface';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { ForecastResponseDto } from 'src/modules/weather/dtos/response/forecast.response.dto';

@Injectable()
export class WeatherService {
    private apiKey: string;
    private baseUrl: string;

    constructor(
        private configService: ConfigService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache
    ) {
        this.apiKey = this.configService.get<string>('WEATHER_API_KEY');
        this.baseUrl = this.configService.get<string>('WEATHER_API_URL');
        if (!this.apiKey) {
            console.error(
                'WEATHER_API_KEY is not defined in environment variables'
            );
        }
    }

    async getForecast(locationName: string, days: number = 5) {
        const cacheKey = `forecast:${locationName}:${days}`;

        // Try to get from cache first
        const cachedForecast =
            await this.cacheManager.get<ForecastResponseDto>(cacheKey);
        if (cachedForecast) {
            return cachedForecast;
        }

        try {
            const response = await axios.get<ForecastResponse>(
                `${this.baseUrl}/forecast.json`,
                {
                    params: {
                        key: this.apiKey,
                        q: locationName,
                        days: days,
                        aqi: 'no',
                        alerts: 'no',
                    },
                }
            );

            const { location, current, forecast } = response.data;

            // Extract sunrise and sunset times from the first day
            const astronomy = forecast.forecastday[0].astro;

            // Format daily forecast
            const dailyForecast = forecast.forecastday.map(day => ({
                date: day.date,
                max_temp_c: day.day.maxtemp_c,
                min_temp_c: day.day.mintemp_c,
                avg_temp_c: day.day.avgtemp_c,
                condition: day.day.condition.text,
                icon: day.day.condition.icon,
                hourly_forecast: day.hour
                    .filter((_hour, index) => index % 3 === 0) // Get every 3 hours
                    .map(hour => ({
                        time: hour.time_epoch,
                        temp_c: hour.temp_c,
                        condition: hour.condition.text,
                        wind_kph: hour.wind_kph,
                        icon: hour.condition.icon,
                        wind_dir: hour.wind_dir,
                        is_day: hour.is_day,
                    })),
            }));

            const result = {
                location: {
                    name: location.name,
                    country: location.country,
                    localtime: location.localtime_epoch,
                    tz: location.tz_id,
                },
                current: {
                    temp_c: current.temp_c,
                    feels_like_c: current.feelslike_c,
                    condition: current.condition.text,
                    humidity: current.humidity,
                    wind_kph: current.wind_kph,
                    pressure_mb: current.pressure_mb,
                    uv: current.uv,
                    icon: current.condition.icon,
                    astronomy: {
                        sunrise: astronomy.sunrise,
                        sunset: astronomy.sunset,
                    },
                },
                daily_forecast: dailyForecast,
            };

            // Cache the result for 1 minute
            await this.cacheManager.set(cacheKey, result, 60 * 1000);

            return result;
        } catch (error) {
            if (error.response) {
                throw new HttpException(
                    error.response.data.error.message ||
                        'Error fetching forecast data',
                    error.response.status || HttpStatus.BAD_REQUEST
                );
            }
            throw new HttpException(
                'Failed to fetch forecast data',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async searchLocations(query: string): Promise<SearchResult[]> {
        const cacheKey = `search:${query}`;

        // Try to get from cache first
        const cachedResults =
            await this.cacheManager.get<SearchResult[]>(cacheKey);
        if (cachedResults) {
            return cachedResults;
        }

        try {
            const response = await axios.get<SearchResult[]>(
                `${this.baseUrl}/search.json`,
                {
                    params: {
                        key: this.apiKey,
                        q: query,
                    },
                }
            );

            const results = response.data;

            // Cache the results for 1 hour
            await this.cacheManager.set(cacheKey, results, 60 * 60 * 1000);

            return results;
        } catch (error) {
            if (error.response) {
                throw new HttpException(
                    error.response.data.error.message ||
                        'Error searching locations',
                    error.response.status || HttpStatus.BAD_REQUEST
                );
            }
            throw new HttpException(
                'Failed to search locations',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}
