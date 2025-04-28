import {
    BadRequestException,
    Body,
    Controller,
    ForbiddenException,
    HttpCode,
    HttpStatus,
    InternalServerErrorException,
    Patch,
    Post,
    UnauthorizedException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ClientSession, Connection } from 'mongoose';
import {
    AuthJwtAccessProtected,
    AuthJwtPayload,
    AuthJwtRefreshProtected,
    AuthJwtToken,
} from 'src/modules/auth/decorators/auth.jwt.decorator';
import { AuthJwtAccessPayloadDto } from 'src/modules/auth/dtos/jwt/auth.jwt.access-payload.dto';
import { AuthJwtRefreshPayloadDto } from 'src/modules/auth/dtos/jwt/auth.jwt.refresh-payload.dto';
import { AuthService } from 'src/modules/auth/services/auth.service';
import { InjectDatabaseConnection } from 'src/common/database/decorators/database.decorator';
import { Response } from 'src/common/response/decorators/response.decorator';
import { IResponse } from 'src/common/response/interfaces/response.interface';
import { ENUM_USER_STATUS_CODE_ERROR } from 'src/modules/user/enums/user.status-code.enum';
import { UserService } from 'src/modules/user/services/user.service';
import { AuthRefreshResponseDto } from 'src/modules/auth/dtos/response/auth.refresh.response.dto';
import { AuthChangePasswordRequestDto } from 'src/modules/auth/dtos/request/auth.change-password.request.dto';
import {
    AuthSharedChangePasswordDoc,
    AuthSharedRefreshDoc,
} from 'src/modules/auth/docs/auth.shared.doc';
import { ENUM_APP_STATUS_CODE_ERROR } from 'src/app/enums/app.status-code.enum';
import { ENUM_WORKER_QUEUES } from 'src/worker/enums/worker.enum';
import { Queue } from 'bullmq';
import { ENUM_SEND_EMAIL_PROCESS } from 'src/modules/email/enums/email.enum';
import { InjectQueue } from '@nestjs/bullmq';
import { IUserDoc } from 'src/modules/user/interfaces/user.interface';
import { UserProtected } from 'src/modules/user/decorators/user.decorator';

@ApiTags('modules.shared.auth')
@Controller({
    version: '1',
    path: '/auth',
})
export class AuthSharedController {
    constructor(
        @InjectDatabaseConnection()
        private readonly databaseConnection: Connection,
        @InjectQueue(ENUM_WORKER_QUEUES.EMAIL_QUEUE)
        private readonly emailQueue: Queue,
        private readonly userService: UserService,
        private readonly authService: AuthService
    ) {}

    @AuthSharedRefreshDoc()
    @Response('auth.refresh')
    @UserProtected()
    @AuthJwtRefreshProtected()
    @HttpCode(HttpStatus.OK)
    @Post('/refresh')
    async refresh(
        @AuthJwtToken() refreshToken: string,
        @AuthJwtPayload<AuthJwtRefreshPayloadDto>()
        { user: userFromPayload }: AuthJwtRefreshPayloadDto
    ): Promise<IResponse<AuthRefreshResponseDto>> {
        const user: IUserDoc =
            await this.userService.findOneActiveById(userFromPayload);
        const token = await this.authService.refreshToken(user, refreshToken);

        return {
            data: token,
        };
    }

    @AuthSharedChangePasswordDoc()
    @Response('auth.changePassword')
    @UserProtected()
    @AuthJwtAccessProtected()
    @Patch('/change-password')
    async changePassword(
        @Body() body: AuthChangePasswordRequestDto,
        @AuthJwtPayload<AuthJwtAccessPayloadDto>('user')
        userFromPayload: string
    ): Promise<void> {
        let user = await this.userService.findOneById(userFromPayload);

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

        const [matchPassword] = await Promise.all([
            this.authService.validateUser(body.oldPassword, user.password),
            this.userService.resetPasswordAttempt(user),
        ]);
        if (!matchPassword) {
            await this.userService.increasePasswordAttempt(user);

            throw new BadRequestException({
                statusCode: ENUM_USER_STATUS_CODE_ERROR.PASSWORD_NOT_MATCH,
                message: 'auth.error.passwordNotMatch',
            });
        }

        const [password] = await Promise.all([
            this.authService.createPassword(body.newPassword),
        ]);

        const session: ClientSession =
            await this.databaseConnection.startSession();
        session.startTransaction();

        try {
            user = await this.userService.updatePassword(user, password, {
                session,
            });

            await session.commitTransaction();
            await session.endSession();

            await this.emailQueue.add(
                ENUM_SEND_EMAIL_PROCESS.CHANGE_PASSWORD,
                {
                    send: { email: user.email, name: user.name },
                },
                {
                    debounce: {
                        id: `${ENUM_SEND_EMAIL_PROCESS.CHANGE_PASSWORD}-${user._id}`,
                        ttl: 1000,
                    },
                }
            );
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
