import { registerAs } from '@nestjs/config';

export default registerAs(
    'email',
    (): Record<string, any> => ({
        fromEmail: process.env.EMAIL_FROM,
        supportEmail: process.env.EMAIL_SUPPORT,
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_SECURE,
        user: process.env.EMAIL_USER,
        password: process.env.EMAIL_PASSWORD,
    })
);
