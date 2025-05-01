import { ApiProperty } from '@nestjs/swagger';

export class WeatherResponseDto {
    @ApiProperty({ example: 'Athens' })
    location: string;

    @ApiProperty({ example: 24 })
    temperature: number;

    @ApiProperty({ example: 22 })
    feelsLike: number;

    @ApiProperty({ example: 'Sunny' })
    condition: string;

    @ApiProperty({ example: 41 })
    humidity: number;

    @ApiProperty({ example: 2 })
    windSpeed: number;

    @ApiProperty({ example: 997 })
    pressure: number;

    @ApiProperty({ example: 8 })
    uv: number;

    @ApiProperty({ example: '06:37' })
    sunrise: string;

    @ApiProperty({ example: '20:37' })
    sunset: string;
}

export class ForecastDayDto {
    @ApiProperty({ example: '2023-09-01' })
    date: string;

    @ApiProperty({ example: 20 })
    temperature: number;

    @ApiProperty({ example: 'Partly cloudy' })
    condition: string;
}

export class ForecastHourDto {
    @ApiProperty({ example: '12:00' })
    time: string;

    @ApiProperty({ example: 26 })
    temperature: number;

    @ApiProperty({ example: 'Sunny' })
    condition: string;

    @ApiProperty({ example: 3 })
    windSpeed: number;
}

export class ForecastResponseDto {
    @ApiProperty({ type: [ForecastDayDto] })
    daily: ForecastDayDto[];

    @ApiProperty({ type: [ForecastHourDto] })
    hourly: ForecastHourDto[];
}

export class LocationDto {
    @ApiProperty()
    id: string;

    @ApiProperty({ example: 'Athens' })
    name: string;

    @ApiProperty({ example: 37.9838 })
    latitude: number;

    @ApiProperty({ example: 23.7275 })
    longitude: number;
}
