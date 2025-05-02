import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import {
    IsArray,
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Max,
    Min,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

// Location DTO
export class LocationDto {
    @ApiProperty({
        example: 'Amman',
        description: 'City name',
    })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({
        example: 'Jordan',
        description: 'Country name',
    })
    @IsString()
    @IsNotEmpty()
    country: string;

    @ApiProperty({
        example: 'Asia/Amman',
        description: 'Timezone',
    })
    @IsString()
    @IsNotEmpty()
    tz: string;

    @ApiProperty({
        example: 1714761600,
        description: 'Local time in epoch format',
    })
    @IsNumber()
    @IsNotEmpty()
    localtime: number;
}
// Astronomy DTO
export class AstronomyDto {
    @ApiProperty({
        example: '05:50 AM',
        description: 'Sunrise time',
    })
    @IsString()
    sunrise: string;

    @ApiProperty({
        example: '07:18 PM',
        description: 'Sunset time',
    })
    @IsString()
    sunset: string;
}
// Current Weather DTO
export class CurrentWeatherDto {
    @ApiProperty({
        example: 22.4,
        description: 'Current temperature in Celsius',
    })
    @IsNumber()
    temp_c: number;

    @ApiProperty({
        example: 23.3,
        description: 'Feels like temperature in Celsius',
    })
    @IsNumber()
    feels_like_c: number;

    @ApiProperty({
        example: 'Sunny',
        description: 'Weather condition',
    })
    @IsString()
    condition: string;

    @ApiProperty({
        example: 25,
        description: 'Humidity percentage',
    })
    @IsNumber()
    humidity: number;

    @ApiProperty({
        example: 17.3,
        description: 'Wind speed in kilometers per hour',
    })
    @IsNumber()
    wind_kph: number;

    @ApiProperty({
        example: 1013,
        description: 'Atmospheric pressure in millibars',
    })
    @IsNumber()
    pressure_mb: number;

    @ApiProperty({
        example: 1.6,
        description: 'UV index',
    })
    @IsNumber()
    uv: number;

    @ApiProperty({
        description: 'Astronomy information (sunrise and sunset)',
        type: AstronomyDto,
    })
    @ValidateNested()
    @Type(() => AstronomyDto)
    astronomy: AstronomyDto;
}

// Hourly Forecast DTO
export class HourlyForecastDto {
    @ApiProperty({
        example: '00:00',
        description: 'Hour of the day',
    })
    @IsNumber()
    time: number;

    @ApiProperty({
        example: 14.6,
        description: 'Temperature in Celsius',
    })
    @IsNumber()
    temp_c: number;

    @ApiProperty({
        example: 'Clear',
        description: 'Weather condition',
    })
    @IsString()
    condition: string;

    @ApiProperty({
        example: 4.7,
        description: 'Wind speed in kilometers per hour',
    })
    @IsNumber()
    wind_kph: number;

    @ApiProperty({
        example: '//cdn.weatherapi.com/weather/64x64/night/113.png',
        description: 'Weather condition icon URL',
    })
    @IsString()
    icon: string;
}
// Daily Forecast DTO
export class DailyForecastDto {
    @ApiProperty({
        example: '2025-05-02',
        description: 'Forecast date',
    })
    @IsString()
    date: string;

    @ApiProperty({
        example: 21.2,
        description: 'Maximum temperature in Celsius',
    })
    @IsNumber()
    max_temp_c: number;

    @ApiProperty({
        example: 13.8,
        description: 'Minimum temperature in Celsius',
    })
    @IsNumber()
    min_temp_c: number;

    @ApiProperty({
        example: 17.3,
        description: 'Average temperature in Celsius',
    })
    @IsNumber()
    avg_temp_c: number;

    @ApiProperty({
        example: 'Sunny',
        description: 'Weather condition',
    })
    @IsString()
    condition: string;

    @ApiProperty({
        example: '//cdn.weatherapi.com/weather/64x64/day/113.png',
        description: 'Weather condition icon URL',
    })
    @IsString()
    icon: string;

    @ApiProperty({
        example: 1,
        description: 'Is daytime (1) or nighttime (0)',
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => HourlyForecastDto)
    hourly_forecast: HourlyForecastDto[];
}

// Main Forecast Response DTO
export class ForecastResponseDto {
    @ApiProperty({
        description: 'Location information',
        type: LocationDto,
    })
    @ValidateNested()
    @Type(() => LocationDto)
    location: LocationDto;

    @ApiProperty({
        description: 'Current weather information',
        type: CurrentWeatherDto,
    })
    @ValidateNested()
    @Type(() => CurrentWeatherDto)
    current: CurrentWeatherDto;

    @ApiProperty({
        description: 'Daily forecast information',
        type: [DailyForecastDto],
        isArray: true,
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => DailyForecastDto)
    daily_forecast: DailyForecastDto[];
}
