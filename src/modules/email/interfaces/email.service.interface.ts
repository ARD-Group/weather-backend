import { EmailResetPasswordDto } from 'src/modules/email/dtos/email.reset-password.dto';
import { EmailSendDto } from 'src/modules/email/dtos/email.send.dto';
import { EmailTempPasswordDto } from 'src/modules/email/dtos/email.temp-password.dto';
import { EmailVerificationDto } from 'src/modules/email/dtos/email.verification.dto';
import { EmailVerifiedDto } from 'src/modules/email/dtos/email.verified.dto';

export interface IEmailService {
    sendWelcome({ name, email }: EmailSendDto): Promise<boolean>;
    sendTempPassword(
        { name, email }: EmailSendDto,
        { password, passwordExpiredAt }: EmailTempPasswordDto
    ): Promise<boolean>;
    sendResetPassword(
        { name, email }: EmailSendDto,
        { expiredDate, url }: EmailResetPasswordDto
    ): Promise<boolean>;
    sendVerification(
        { name, email }: EmailSendDto,
        { expiredAt, reference, otp }: EmailVerificationDto
    ): Promise<boolean>;
    sendEmailVerified(
        { name, email }: EmailSendDto,
        { reference }: EmailVerifiedDto
    ): Promise<boolean>;
    sendChangePassword({ name, email }: EmailSendDto): Promise<boolean>;
    sendCreate(
        { name, email }: EmailSendDto,
        { password, passwordExpiredAt }: EmailTempPasswordDto
    ): Promise<boolean>;
}
