import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { AuthModule } from 'src/modules/auth/auth.module';
import { UserUserController } from 'src/modules/user/controllers/user.user.controller';
import { UserModule } from 'src/modules/user/user.module';
import { VerificationUserController } from 'src/modules/verification/controllers/verification.user.controller';
import { VerificationModule } from 'src/modules/verification/verification.module';
import { ENUM_WORKER_QUEUES } from 'src/worker/enums/worker.enum';

@Module({
    controllers: [UserUserController, VerificationUserController],
    providers: [],
    exports: [],
    imports: [
        UserModule,
        AuthModule,
        VerificationModule,
        BullModule.registerQueueAsync({
            name: ENUM_WORKER_QUEUES.EMAIL_QUEUE,
        }),
    ],
})
export class RoutesUserModule {}
