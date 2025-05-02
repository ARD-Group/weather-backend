import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Max, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class ForecastRequestDto {
    @ApiProperty({
        example: faker.number.int({ min: 1, max: 5 }),
        required: false,
        description: 'Number of days to forecast',
        type: 'number',
        minimum: 1,
        maximum: 5,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(5)
    days?: number;
}
