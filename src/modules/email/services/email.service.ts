import { Injectable, Logger } from '@nestjs/common';
import { title } from 'case';
import { ConfigService } from '@nestjs/config';
import { readFileSync } from 'fs';
import { EmailSendDto } from 'src/modules/email/dtos/email.send.dto';
import { HelperDateService } from 'src/common/helper/services/helper.date.service';
import { EmailTempPasswordDto } from 'src/modules/email/dtos/email.temp-password.dto';
import { EmailResetPasswordDto } from 'src/modules/email/dtos/email.reset-password.dto';
import { EmailVerificationDto } from 'src/modules/email/dtos/email.verification.dto';
import { EmailVerifiedDto } from 'src/modules/email/dtos/email.verified.dto';
import * as nodemailer from 'nodemailer';
import { IEmailService } from 'src/modules/email/interfaces/email.service.interface';

@Injectable()
export class EmailService implements IEmailService {
    private readonly logger = new Logger(EmailService.name);
    private transporter: nodemailer.Transporter;

    private readonly fromEmail: string;
    private readonly supportEmail: string;
    private readonly homeName: string;
    private readonly homeUrl: string;

    constructor(
        private readonly helperDateService: HelperDateService,
        private readonly configService: ConfigService
    ) {
        this.fromEmail = this.configService.get<string>('email.fromEmail');
        this.supportEmail =
            this.configService.get<string>('email.supportEmail');
        this.homeName = this.configService.get<string>('home.name');
        this.homeUrl = this.configService.get<string>('home.url');

        // Initialize Nodemailer transporter
        this.transporter = nodemailer.createTransport({
            host:
                this.configService.get<string>('email.host') ??
                'smtp.gmail.com',
            port: this.configService.get<number>('email.port') ?? 587,
            secure: this.configService.get<boolean>('email.secure') ?? false,
            auth: {
                user:
                    this.configService.get<string>('email.user') ??
                    'ard.group1999@gmail.com',
                pass:
                    this.configService.get<string>('email.password') ??
                    'epwbssdwepmrhyue',
            },
        });
    }

    private async sendEmail(
        to: string,
        subject: string,
        html: string
    ): Promise<boolean> {
        try {
            await this.transporter.sendMail({
                from: this.fromEmail,
                to,
                subject,
                html,
            });
            return true;
        } catch (err) {
            this.logger.error(err);
            return false;
        }
    }

    async sendWelcome({ name, email }: EmailSendDto): Promise<boolean> {
        const html = readFileSync(
            `${__dirname}/../templates/welcome.template.html`,
            'utf8'
        ).replace(/\{\{(\w+)\}\}/g, (match, key) => {
            const replacements = {
                homeName: this.homeName,
                name: title(name),
                email: title(email),
                supportEmail: this.supportEmail,
                homeUrl: this.homeUrl,
            };
            return replacements[key] || match;
        });

        return this.sendEmail(email, 'Welcome', html);
    }

    async sendTempPassword(
        { name, email }: EmailSendDto,
        { password: passwordString, passwordExpiredAt }: EmailTempPasswordDto
    ): Promise<boolean> {
        const html = readFileSync(
            `${__dirname}/../templates/temp-password.template.html`,
            'utf8'
        ).replace(/\{\{(\w+)\}\}/g, (match, key) => {
            const replacements = {
                homeName: this.homeName,
                name: title(name),
                password: passwordString,
                supportEmail: this.supportEmail,
                homeUrl: this.homeUrl,
                passwordExpiredAt:
                    this.helperDateService.formatToRFC2822(passwordExpiredAt),
            };
            return replacements[key] || match;
        });

        return this.sendEmail(email, 'Temporary Password', html);
    }

    async sendResetPassword(
        { name, email }: EmailSendDto,
        { expiredDate, url }: EmailResetPasswordDto
    ): Promise<boolean> {
        const html = readFileSync(
            `${__dirname}/../templates/reset-password.template.html`,
            'utf8'
        ).replace(/\{\{(\w+)\}\}/g, (match, key) => {
            const replacements = {
                homeName: this.homeName,
                name: title(name),
                supportEmail: this.supportEmail,
                homeUrl: this.homeUrl,
                url: `${this.homeUrl}/${url}`,
                expiredDate:
                    this.helperDateService.formatToIsoDate(expiredDate),
            };
            return replacements[key] || match;
        });

        return this.sendEmail(email, 'Reset Password', html);
    }

    async sendVerification(
        { name, email }: EmailSendDto,
        { expiredAt, reference, otp }: EmailVerificationDto
    ): Promise<boolean> {
        const html = readFileSync(
            `${__dirname}/../templates/email-verification.template.html`,
            'utf8'
        ).replace(/\{(\w+)\}/g, (match, key) => {
            const replacements = {
                homeName: this.homeName,
                name: title(name),
                supportEmail: this.supportEmail,
                homeUrl: this.homeUrl,
                expiredAt: this.helperDateService.formatToIsoDate(expiredAt),
                otp,
                reference,
            };
            return replacements[key] || match;
        });

        return this.sendEmail(email, 'Email Verification', html);
    }

    async sendEmailVerified(
        { name, email }: EmailSendDto,
        { reference }: EmailVerifiedDto
    ): Promise<boolean> {
        const html = readFileSync(
            `${__dirname}/../templates/email-verified.template.html`,
            'utf8'
        ).replace(/\{\{(\w+)\}\}/g, (match, key) => {
            const replacements = {
                homeName: this.homeName,
                name: title(name),
                supportEmail: this.supportEmail,
                homeUrl: this.homeUrl,
                reference,
            };
            return replacements[key] || match;
        });

        return this.sendEmail(email, 'Email Verified', html);
    }

    async sendChangePassword({ name, email }: EmailSendDto): Promise<boolean> {
        const html = readFileSync(
            `${__dirname}/../templates/change-password.template.html`,
            'utf8'
        ).replace(/\{\{(\w+)\}\}/g, (match, key) => {
            const replacements = {
                homeName: this.homeName,
                name: title(name),
                supportEmail: this.supportEmail,
                homeUrl: this.homeUrl,
            };
            return replacements[key] || match;
        });

        return this.sendEmail(email, 'Password Changed', html);
    }

    async sendCreate(
        { name, email }: EmailSendDto,
        { password: passwordString, passwordExpiredAt }: EmailTempPasswordDto
    ): Promise<boolean> {
        const html = readFileSync(
            `${__dirname}/../templates/create.template.html`,
            'utf8'
        ).replace(/\{\{(\w+)\}\}/g, (match, key) => {
            const replacements = {
                homeName: this.homeName,
                name: title(name),
                supportEmail: this.supportEmail,
                homeUrl: this.homeUrl,
                password: passwordString,
                passwordExpiredAt:
                    this.helperDateService.formatToIsoDate(passwordExpiredAt),
            };
            return replacements[key] || match;
        });

        return this.sendEmail(email, 'Account Created', html);
    }
}
