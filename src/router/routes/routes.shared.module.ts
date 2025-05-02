import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { AuthModule } from 'src/modules/auth/auth.module';
import { AuthSharedController } from 'src/modules/auth/controllers/auth.shared.controller';
import { EmailModule } from 'src/modules/email/email.module';
import { UserSharedController } from 'src/modules/user/controllers/user.shared.controller';
import { UserModule } from 'src/modules/user/user.module';
import { ENUM_WORKER_QUEUES } from 'src/worker/enums/worker.enum';

@Module({
    controllers: [UserSharedController, AuthSharedController],
    providers: [],
    exports: [],
    imports: [
        UserModule,
        EmailModule,
        AuthModule,
        BullModule.registerQueueAsync({
            name: ENUM_WORKER_QUEUES.EMAIL_QUEUE,
        }),
    ],
})
export class RoutesSharedModule {}
