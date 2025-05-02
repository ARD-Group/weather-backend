import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

import { IsNotEmpty } from 'class-validator';

export class SearchRequestDto {
    @ApiProperty({
        example: faker.location.city(),
        required: true,
        description: 'Search query',
    })
    @IsString()
    @IsNotEmpty()
    q: string;
}
