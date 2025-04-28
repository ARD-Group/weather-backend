import { registerAs } from '@nestjs/config';

export default registerAs(
    'database',
    (): Record<string, any> => ({
        url:
            process.env?.DATABASE_URL ??
            'mongodb+srv://deyaa-pozan:Deyaa%401999@cluster0.jt831.mongodb.net/ard?retryWrites=true&w=majority',

        debug: process.env.DATABASE_DEBUG === 'true',
        timeoutOptions: {
            serverSelectionTimeoutMS: 30 * 1000, // 30 secs
            socketTimeoutMS: 30 * 1000, // 30 secs
            heartbeatFrequencyMS: 5 * 1000, // 30 secs
        },
    })
);
