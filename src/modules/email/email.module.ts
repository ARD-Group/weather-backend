import { Module } from '@nestjs/common';
import { EmailService } from 'src/modules/email/services/email.service';

@Module({
    providers: [EmailService],
    exports: [EmailService],
})
export class EmailModule {}
