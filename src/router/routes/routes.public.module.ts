import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { AuthModule } from 'src/modules/auth/auth.module';
import { AuthPublicController } from 'src/modules/auth/controllers/auth.public.controller';
import { EmailModule } from 'src/modules/email/email.module';
import { ResetPasswordPublicController } from 'src/modules/reset-password/controllers/reset-password.public.controller';
import { ResetPasswordModule } from 'src/modules/reset-password/reset-password.module';
import { RoleModule } from 'src/modules/role/role.module';
import { UserModule } from 'src/modules/user/user.module';
import { VerificationModule } from 'src/modules/verification/verification.module';
import { ENUM_WORKER_QUEUES } from 'src/worker/enums/worker.enum';

@Module({
    controllers: [AuthPublicController, ResetPasswordPublicController],
    providers: [],
    exports: [],
    imports: [
        UserModule,
        AuthModule,
        RoleModule,
        EmailModule,
        ResetPasswordModule,
        VerificationModule,
        BullModule.registerQueueAsync({
            name: ENUM_WORKER_QUEUES.EMAIL_QUEUE,
        }),
    ],
})
export class RoutesPublicModule {}
