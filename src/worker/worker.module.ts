import { Module } from '@nestjs/common';
import { EmailModule } from 'src/modules/email/email.module';
import { EmailProcessor } from 'src/modules/email/processors/email.processor';

@Module({
    imports: [EmailModule],
    providers: [EmailProcessor],
})
export class WorkerModule {}
