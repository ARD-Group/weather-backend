import { faker } from '@faker-js/faker';

export const ForecastDocParamsId = [
    {
        name: 'location',
        allowEmptyValue: false,
        required: true,
        type: 'string',
        example: faker.location.city(),
    },
];

export const ForecastDocQueryDays = [
    {
        name: 'days',
        allowEmptyValue: true,
        required: false,
        type: 'number',
        example: 1,
        description: 'Number of days to forecast (1-5)',
    },
];
