import {
    BadRequestException,
    Body,
    ConflictException,
    Controller,
    ForbiddenException,
    HttpCode,
    HttpStatus,
    InternalServerErrorException,
    NotFoundException,
    Post,
    Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthJwtPayload } from 'src/modules/auth/decorators/auth.jwt.decorator';
import { AuthSocialGoogleProtected } from 'src/modules/auth/decorators/auth.social.decorator';
import { AuthSocialGooglePayloadDto } from 'src/modules/auth/dtos/social/auth.social.google-payload.dto';
import { AuthService } from 'src/modules/auth/services/auth.service';
import { Response } from 'src/common/response/decorators/response.decorator';
import { IResponse } from 'src/common/response/interfaces/response.interface';
import { ENUM_ROLE_STATUS_CODE_ERROR } from 'src/modules/role/enums/role.status-code.enum';
import { AuthLoginResponseDto } from 'src/modules/auth/dtos/response/auth.login.response.dto';
import {
    AuthPublicLoginCredentialDoc,
    AuthPublicLoginSocialGoogleDoc,
    AuthPublicSignUpDoc,
} from 'src/modules/auth/docs/auth.public.doc';
import { AuthLoginRequestDto } from 'src/modules/auth/dtos/request/auth.login.request.dto';
import { UserService } from 'src/modules/user/services/user.service';
import { UserDoc } from 'src/modules/user/repository/entities/user.entity';
import { ENUM_USER_STATUS_CODE_ERROR } from 'src/modules/user/enums/user.status-code.enum';
import { ENUM_USER_STATUS } from 'src/modules/user/enums/user.enum';
import { ClientSession } from 'mongoose';
import { ENUM_SEND_EMAIL_PROCESS } from 'src/modules/email/enums/email.enum';
import { ENUM_APP_STATUS_CODE_ERROR } from 'src/app/enums/app.status-code.enum';
import { InjectDatabaseConnection } from 'src/common/database/decorators/database.decorator';
import { ENUM_WORKER_QUEUES } from 'src/worker/enums/worker.enum';
import { Connection } from 'mongoose';
import { Queue } from 'bullmq';
import { RoleService } from 'src/modules/role/services/role.service';
import { IRequestApp } from 'src/common/request/interfaces/request.interface';
import { InjectQueue } from '@nestjs/bullmq';
import { VerificationService } from 'src/modules/verification/services/verification.service';
import { IUserDoc } from 'src/modules/user/interfaces/user.interface';

@ApiTags('modules.public.auth')
@Controller({
    version: '1',
    path: '/auth',
})
export class AuthPublicController {
    constructor(
        @InjectDatabaseConnection()
        private readonly databaseConnection: Connection,
        @InjectQueue(ENUM_WORKER_QUEUES.EMAIL_QUEUE)
        private readonly emailQueue: Queue,
        private readonly userService: UserService,
        private readonly authService: AuthService,
        private readonly roleService: RoleService,
        private readonly verificationService: VerificationService
    ) {}

    @AuthPublicLoginCredentialDoc()
    @Response('auth.loginWithCredential')
    @HttpCode(HttpStatus.OK)
    @Post('/login/credential')
    async loginWithCredential(
        @Body() { email, password }: AuthLoginRequestDto,
        @Req() request: IRequestApp
    ): Promise<IResponse<AuthLoginResponseDto>> {
        let user: UserDoc = await this.userService.findOneByEmail(email);
        if (!user) {
            throw new NotFoundException({
                statusCode: ENUM_USER_STATUS_CODE_ERROR.NOT_FOUND,
                message: 'user.error.notFound',
            });
        }

        const passwordAttempt: boolean =
            await this.authService.getPasswordAttempt();
        const passwordMaxAttempt: number =
            await this.authService.getPasswordMaxAttempt();
        if (passwordAttempt && user.passwordAttempt >= passwordMaxAttempt) {
            throw new ForbiddenException({
                statusCode: ENUM_USER_STATUS_CODE_ERROR.PASSWORD_ATTEMPT_MAX,
                message: 'auth.error.passwordAttemptMax',
            });
        }

        const validate: boolean = await this.authService.validateUser(
            password,
            user.password
        );
        if (!validate) {
            user = await this.userService.increasePasswordAttempt(user);

            throw new BadRequestException({
                statusCode: ENUM_USER_STATUS_CODE_ERROR.PASSWORD_NOT_MATCH,
                message: 'auth.error.passwordNotMatch',
                data: {
                    attempt: user.passwordAttempt,
                },
            });
        } else if (user.status !== ENUM_USER_STATUS.ACTIVE) {
            throw new ForbiddenException({
                statusCode: ENUM_USER_STATUS_CODE_ERROR.INACTIVE_FORBIDDEN,
                message: 'user.error.inactive',
            });
        }

        if (user.verification.email !== true) {
            throw new ForbiddenException({
                statusCode: ENUM_USER_STATUS_CODE_ERROR.EMAIL_NOT_VERIFIED,
                message: 'verification.error.emailNotVerified',
            });
        }

        const userWithRole: IUserDoc = await this.userService.join(user);
        if (!userWithRole.role.isActive) {
            throw new ForbiddenException({
                statusCode: ENUM_ROLE_STATUS_CODE_ERROR.INACTIVE_FORBIDDEN,
                message: 'role.error.inactive',
            });
        }

        await this.userService.resetPasswordAttempt(user);

        const checkPasswordExpired: boolean =
            await this.authService.checkPasswordExpired(user.passwordExpired);
        if (checkPasswordExpired) {
            throw new ForbiddenException({
                statusCode: ENUM_USER_STATUS_CODE_ERROR.PASSWORD_EXPIRED,
                message: 'auth.error.passwordExpired',
            });
        }

        const databaseSession: ClientSession =
            await this.databaseConnection.startSession();
        databaseSession.startTransaction();

        try {
            await databaseSession.commitTransaction();
            await databaseSession.endSession();

            const token = await this.authService.createToken(userWithRole);

            return {
                data: token,
            };
        } catch (err: any) {
            await databaseSession.abortTransaction();
            await databaseSession.endSession();

            throw new InternalServerErrorException({
                statusCode: ENUM_APP_STATUS_CODE_ERROR.UNKNOWN,
                message: 'http.serverError.internalServerError',
                _error: err.message,
            });
        }
    }

    @AuthPublicLoginSocialGoogleDoc()
    @Response('auth.loginWithSocialGoogle')
    @AuthSocialGoogleProtected()
    @Post('/login/social/google')
    async loginWithGoogle(
        @AuthJwtPayload<AuthSocialGooglePayloadDto>('email')
        email: string
    ): Promise<IResponse<AuthLoginResponseDto>> {
        const user: UserDoc = await this.userService.findOneByEmail(email);
        if (!user) {
            throw new NotFoundException({
                statusCode: ENUM_USER_STATUS_CODE_ERROR.NOT_FOUND,
                message: 'user.error.notFound',
            });
        } else if (user.status !== ENUM_USER_STATUS.ACTIVE) {
            throw new ForbiddenException({
                statusCode: ENUM_USER_STATUS_CODE_ERROR.INACTIVE_FORBIDDEN,
                message: 'user.error.inactive',
            });
        }

        const userWithRole: IUserDoc = await this.userService.join(user);
        if (!userWithRole.role.isActive) {
            throw new ForbiddenException({
                statusCode: ENUM_ROLE_STATUS_CODE_ERROR.INACTIVE_FORBIDDEN,
                message: 'role.error.inactive',
            });
        }

        await this.userService.resetPasswordAttempt(user);

        const checkPasswordExpired: boolean =
            await this.authService.checkPasswordExpired(user.passwordExpired);
        if (checkPasswordExpired) {
            throw new ForbiddenException({
                statusCode: ENUM_USER_STATUS_CODE_ERROR.PASSWORD_EXPIRED,
                message: 'auth.error.passwordExpired',
            });
        }

        const databaseSession: ClientSession =
            await this.databaseConnection.startSession();
        databaseSession.startTransaction();

        try {
            await databaseSession.commitTransaction();
            await databaseSession.endSession();

            const token = await this.authService.createToken(userWithRole);

            return {
                data: token,
            };
        } catch (err: any) {
            await databaseSession.abortTransaction();
            await databaseSession.endSession();

            throw new InternalServerErrorException({
                statusCode: ENUM_APP_STATUS_CODE_ERROR.UNKNOWN,
                message: 'http.serverError.internalServerError',
                _error: err.message,
            });
        }
    }

    @AuthPublicSignUpDoc()
    @Response('auth.signUp')
    @Post('/sign-up')
    async signUp(
        @Body()
        { email, name, password: passwordString }: any
    ): Promise<void> {
        const promises: Promise<any>[] = [
            this.roleService.findOneByName('individual'),
            this.userService.existByEmail(email),
        ];

        const [role, emailExist] = await Promise.all(promises);

        if (!role) {
            throw new NotFoundException({
                statusCode: ENUM_ROLE_STATUS_CODE_ERROR.NOT_FOUND,
                message: 'role.error.notFound',
            });
        } else if (emailExist) {
            throw new ConflictException({
                statusCode: ENUM_USER_STATUS_CODE_ERROR.EMAIL_EXIST,
                message: 'user.error.emailExist',
            });
        }

        const password = await this.authService.createPassword(passwordString);

        const session: ClientSession =
            await this.databaseConnection.startSession();
        session.startTransaction();

        try {
            const user = await this.userService.signUp(
                role._id,
                {
                    email,
                    name,
                    password: passwordString,
                },
                password,
                { session }
            );

            const [verification] = await Promise.all([
                this.verificationService.createEmailByUser(user, { session }),
            ]);

            await Promise.all([
                this.emailQueue.add(
                    ENUM_SEND_EMAIL_PROCESS.VERIFICATION,
                    {
                        send: { email, name },
                        data: {
                            otp: verification.otp,
                            expiredAt: verification.expiredDate,
                            reference: verification.reference,
                        },
                    },
                    {
                        debounce: {
                            id: `${ENUM_SEND_EMAIL_PROCESS.VERIFICATION}-${user._id}`,
                            ttl: 1000,
                        },
                    }
                ),
            ]);

            await session.commitTransaction();
            await session.endSession();
        } catch (err: any) {
            await session.abortTransaction();
            await session.endSession();

            throw new InternalServerErrorException({
                statusCode: ENUM_APP_STATUS_CODE_ERROR.UNKNOWN,
                message: 'http.serverError.internalServerError',
                _error: err.message,
            });
        }

        return;
    }
}
