import { registerAs } from '@nestjs/config';

export default registerAs(
    'email',
    (): Record<string, any> => ({
        fromEmail: 'ard.group1999@gmail.com',
        supportEmail: 'ard.group1999@gmail.com',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        user: 'ard.group1999@gmail.com',
        password: 'epwb ssdw epmr hyue',
    })
);
