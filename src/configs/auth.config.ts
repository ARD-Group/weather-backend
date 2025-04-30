import { registerAs } from '@nestjs/config';
import ms from 'ms';

export default registerAs(
    'auth',
    (): Record<string, any> => ({
        jwt: {
            accessToken: {
                secretKey: process.env.AUTH_JWT_ACCESS_TOKEN_SECRET_KEY,
                expirationTime:
                    ms(
                        process.env
                            .AUTH_JWT_ACCESS_TOKEN_EXPIRED as ms.StringValue
                    ) / 1000,
            },

            refreshToken: {
                secretKey: process.env.AUTH_JWT_REFRESH_TOKEN_SECRET_KEY,
                expirationTime:
                    ms(
                        process.env
                            .AUTH_JWT_REFRESH_TOKEN_EXPIRED as ms.StringValue
                    ) / 1000,
            },

            audience: process.env.AUTH_JWT_AUDIENCE,
            issuer: process.env.AUTH_JWT_ISSUER,
            header: 'Authorization',
            prefix: 'Bearer',
        },

        password: {
            attempt: true,
            maxAttempt: 5,
            saltLength: 8,
            expiredIn: ms('182d') / 1000, // 0.5 years
            expiredInTemporary: ms('3d') / 1000, // 3 days
            period: ms('90d') / 1000, // 3 months
        },

        google: {
            header: 'Authorization',
            prefix: 'Bearer',
            clientId:
                process.env.AUTH_SOCIAL_GOOGLE_CLIENT_ID ??
                '742457672807-lur6aj082tt8o6669uhsgclln40h17nm.apps.googleusercontent.com',
            clientSecret:
                process.env.AUTH_SOCIAL_GOOGLE_CLIENT_SECRET ??
                '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',
        },
    })
);
