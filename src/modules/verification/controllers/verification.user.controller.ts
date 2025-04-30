import { InjectQueue } from '@nestjs/bullmq';
import {
    BadRequestException,
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    InternalServerErrorException,
    NotFoundException,
    Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Queue } from 'bullmq';
import { ClientSession, Connection } from 'mongoose';
import { ENUM_APP_STATUS_CODE_ERROR } from 'src/app/enums/app.status-code.enum';
import { InjectDatabaseConnection } from 'src/common/database/decorators/database.decorator';
import { Response } from 'src/common/response/decorators/response.decorator';
import { IResponse } from 'src/common/response/interfaces/response.interface';
import {
    AuthJwtAccessProtected,
    AuthJwtPayload,
} from 'src/modules/auth/decorators/auth.jwt.decorator';
import { AuthJwtAccessPayloadDto } from 'src/modules/auth/dtos/jwt/auth.jwt.access-payload.dto';
import { ENUM_SEND_EMAIL_PROCESS } from 'src/modules/email/enums/email.enum';
import { PolicyRoleProtected } from 'src/modules/policy/decorators/policy.decorator';
import { ENUM_POLICY_ROLE_TYPE } from 'src/modules/policy/enums/policy.enum';
import { ResetPasswordVerifyRequestDto } from 'src/modules/reset-password/dtos/request/reset-password.verify.request.dto';
import { UserProtected } from 'src/modules/user/decorators/user.decorator';
import { UserParsePipe } from 'src/modules/user/pipes/user.parse.pipe';
import { UserDoc } from 'src/modules/user/repository/entities/user.entity';
import { UserService } from 'src/modules/user/services/user.service';
import {
    VerificationUserGetEmailDoc,
    VerificationUserResendEmailDoc,
    VerificationUserVerifyEmailDoc,
} from 'src/modules/verification/docs/verification.user.doc';
import { VerificationResendEmailRequestDto } from 'src/modules/verification/dtos/request/verification.resend.request.dto';
import { VerificationVerifyRequestDto } from 'src/modules/verification/dtos/request/verification.verify.request.dto';
import { VerificationResponse } from 'src/modules/verification/dtos/response/verification.response';
import { ENUM_VERIFICATION_STATUS_CODE_ERROR } from 'src/modules/verification/enums/verification.status-code.constant';
import { VerificationUserEmailNotVerifiedYetPipe } from 'src/modules/verification/pipes/verification.user-not-verified-yet.pipe';
import { VerificationDoc } from 'src/modules/verification/repository/entity/verification.entity';
import { VerificationService } from 'src/modules/verification/services/verification.service';
import { ENUM_WORKER_QUEUES } from 'src/worker/enums/worker.enum';

@ApiTags('modules.user.verification')
@Controller({
    version: '1',
    path: '/verification',
})
export class VerificationUserController {
    constructor(
        @InjectDatabaseConnection()
        private readonly databaseConnection: Connection,
        @InjectQueue(ENUM_WORKER_QUEUES.EMAIL_QUEUE)
        private readonly emailQueue: Queue,
        private readonly verificationService: VerificationService,
        private readonly userService: UserService
    ) {}

    @VerificationUserGetEmailDoc()
    @Response('verification.getEmail')
    @PolicyRoleProtected(ENUM_POLICY_ROLE_TYPE.USER)
    @UserProtected()
    @AuthJwtAccessProtected()
    @Get('/get/email')
    async getEmail(
        @AuthJwtPayload<AuthJwtAccessPayloadDto>('user', UserParsePipe)
        user: UserDoc
    ): Promise<IResponse<VerificationResponse>> {
        const verification: VerificationDoc =
            await this.verificationService.findOneLatestEmailByUser(user._id);
        if (!verification) {
            throw new NotFoundException({
                statusCode: ENUM_VERIFICATION_STATUS_CODE_ERROR.NOT_FOUND,
                message: 'verification.error.notFound',
            });
        }

        const mapped: VerificationResponse =
            this.verificationService.map(verification);

        return {
            data: mapped,
        };
    }

    @VerificationUserResendEmailDoc()
    @Response('verification.resendEmail')
    @Post('/resend/email')
    async resendEmail(
        @Body() { email }: VerificationResendEmailRequestDto
    ): Promise<IResponse<VerificationResponse>> {
        const latestVerification: VerificationDoc =
            await this.verificationService.findOneLatestEmailByUser(email);
        console.log('latestVerification', latestVerification);
        if (latestVerification) {
            const mapped: VerificationResponse =
                this.verificationService.map(latestVerification);

            return {
                data: mapped,
            };
        }

        const session: ClientSession =
            await this.databaseConnection.startSession();
        session.startTransaction();

        try {
            await this.verificationService.inactiveEmailManyByEmail(email, {
                session,
            });

            const verification: VerificationDoc =
                await this.verificationService.createEmailByEmail(email, {
                    session,
                });

            await session.commitTransaction();
            await session.endSession();

            await this.emailQueue.add(
                ENUM_SEND_EMAIL_PROCESS.VERIFICATION,
                {
                    send: { email: email },
                    data: {
                        otp: verification.otp,
                        expiredAt: verification.expiredDate,
                        reference: verification.reference,
                    },
                },
                {
                    debounce: {
                        id: `${ENUM_SEND_EMAIL_PROCESS.VERIFICATION}-${email}`,
                        ttl: 1000,
                    },
                }
            );

            const mapped: VerificationResponse =
                this.verificationService.map(latestVerification);

            return {
                data: mapped,
            };
        } catch (err: any) {
            await session.abortTransaction();
            await session.endSession();

            throw new InternalServerErrorException({
                statusCode: ENUM_APP_STATUS_CODE_ERROR.UNKNOWN,
                message: 'http.serverError.internalServerError',
                _error: err.message,
            });
        }
    }

    @VerificationUserVerifyEmailDoc()
    @Response('verification.verifyEmail')
    @HttpCode(HttpStatus.OK)
    @Post('/verify/email')
    async verifyEmail(
        @Body() { otp, email }: VerificationVerifyRequestDto
    ): Promise<void> {
        console.log('email===', email);

        const verification: VerificationDoc =
            await this.verificationService.findOneLatestEmailByUser(email);
        console.log('verification', verification);

        if (!verification) {
            throw new NotFoundException({
                statusCode: ENUM_VERIFICATION_STATUS_CODE_ERROR.NOT_FOUND,
                message: 'verification.error.notFound',
            });
        }

        const check: boolean = this.verificationService.validateOtp(
            verification,
            otp
        );
        if (!check) {
            throw new BadRequestException({
                statusCode: ENUM_VERIFICATION_STATUS_CODE_ERROR.OTP_NOT_MATCH,
                message: 'verification.error.otpNotMatch',
            });
        }

        const session: ClientSession =
            await this.databaseConnection.startSession();
        session.startTransaction();

        try {
            await Promise.all([
                this.verificationService.verify(verification, {
                    session,
                }),
                this.userService.updateVerificationEmail(email, {
                    session,
                }),
            ]);

            await session.commitTransaction();
            await session.endSession();

            await this.emailQueue.add(
                ENUM_SEND_EMAIL_PROCESS.EMAIL_VERIFIED,
                {
                    send: { email: email },
                    data: {
                        reference: verification.reference,
                    },
                },
                {
                    debounce: {
                        id: `${ENUM_SEND_EMAIL_PROCESS.EMAIL_VERIFIED}-${email}`,
                        ttl: 1000,
                    },
                }
            );

            return;
        } catch (err: any) {
            await session.abortTransaction();
            await session.endSession();

            throw new InternalServerErrorException({
                statusCode: ENUM_APP_STATUS_CODE_ERROR.UNKNOWN,
                message: 'http.serverError.internalServerError',
                _error: err.message,
            });
        }
    }
}
