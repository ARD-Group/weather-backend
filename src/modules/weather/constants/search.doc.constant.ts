import { faker } from '@faker-js/faker';

export const SearchDocQueryQ = [
    {
        name: 'q',
        allowEmptyValue: true,
        required: false,
        type: 'string',
        example: faker.location.city(),
        description: 'Search query',
    },
];
