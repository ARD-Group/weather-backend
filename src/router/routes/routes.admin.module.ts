import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { AuthModule } from 'src/modules/auth/auth.module';
import { AuthAdminController } from 'src/modules/auth/controllers/auth.admin.controller';
import { EmailModule } from 'src/modules/email/email.module';
import { RoleAdminController } from 'src/modules/role/controllers/role.admin.controller';
import { RoleModule } from 'src/modules/role/role.module';
import { UserAdminController } from 'src/modules/user/controllers/user.admin.controller';
import { UserModule } from 'src/modules/user/user.module';
import { VerificationModule } from 'src/modules/verification/verification.module';
import { ENUM_WORKER_QUEUES } from 'src/worker/enums/worker.enum';

@Module({
    controllers: [
        RoleAdminController,
        UserAdminController,
        AuthAdminController,
    ],
    providers: [],
    exports: [],
    imports: [
        RoleModule,
        UserModule,
        AuthModule,
        EmailModule,
        VerificationModule,
        BullModule.registerQueueAsync({
            name: ENUM_WORKER_QUEUES.EMAIL_QUEUE,
        }),
    ],
})
export class RoutesAdminModule {}
