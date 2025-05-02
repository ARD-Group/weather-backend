import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class SearchResponseDto {
    @ApiProperty({
        example: 'Amman',
        description: 'City or location name',
    })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({
        example: 'Amman Governorate',
        description: 'Region or state of the location',
    })
    @IsString()
    @IsNotEmpty()
    region: string;

    @ApiProperty({
        example: 'Jordan',
        description: 'Country name',
    })
    @IsString()
    @IsNotEmpty()
    country: string;

    @ApiProperty({
        example: 31.95,
        description: 'Latitude coordinate of the location',
    })
    @IsNumber()
    lat: number;

    @ApiProperty({
        example: 35.93,
        description: 'Longitude coordinate of the location',
    })
    @IsNumber()
    lon: number;
}
