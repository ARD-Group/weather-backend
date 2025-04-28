import {
    BadRequestException,
    Body,
    ConflictException,
    Controller,
    Delete,
    InternalServerErrorException,
    NotFoundException,
    Put,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
    AuthJwtAccessProtected,
    AuthJwtPayload,
} from 'src/modules/auth/decorators/auth.jwt.decorator';
import { PolicyRoleProtected } from 'src/modules/policy/decorators/policy.decorator';
import { Response } from 'src/common/response/decorators/response.decorator';
import { UserService } from 'src/modules/user/services/user.service';
import {
    UserUserDeleteDoc,
    UserUserUpdateUsernameDoc,
} from 'src/modules/user/docs/user.user.doc';
import { UserUpdateClaimUsernameRequestDto } from 'src/modules/user/dtos/request/user.update-claim-username.dto';
import { ENUM_USER_STATUS_CODE_ERROR } from 'src/modules/user/enums/user.status-code.enum';
import { UserParsePipe } from 'src/modules/user/pipes/user.parse.pipe';
import { UserDoc } from 'src/modules/user/repository/entities/user.entity';
import { InjectDatabaseConnection } from 'src/common/database/decorators/database.decorator';
import { ClientSession, Connection } from 'mongoose';
import { ENUM_APP_STATUS_CODE_ERROR } from 'src/app/enums/app.status-code.enum';
import { ENUM_POLICY_ROLE_TYPE } from 'src/modules/policy/enums/policy.enum';
import { UserProtected } from 'src/modules/user/decorators/user.decorator';

@ApiTags('modules.user.user')
@Controller({
    version: '1',
    path: '/user',
})
export class UserUserController {
    constructor(
        @InjectDatabaseConnection()
        private readonly databaseConnection: Connection,
        private readonly userService: UserService
    ) {}

    @UserUserDeleteDoc()
    @Response('user.delete')
    @PolicyRoleProtected(ENUM_POLICY_ROLE_TYPE.USER)
    @UserProtected()
    @AuthJwtAccessProtected()
    @Delete('/delete')
    async delete(
        @AuthJwtPayload('user', UserParsePipe) user: UserDoc
    ): Promise<void> {
        const session: ClientSession =
            await this.databaseConnection.startSession();
        session.startTransaction();

        try {
            await this.userService.softDelete(
                user,
                { deletedBy: user._id },
                { session }
            );

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

    @UserUserUpdateUsernameDoc()
    @Response('user.updateClaimUsername')
    @PolicyRoleProtected(ENUM_POLICY_ROLE_TYPE.USER)
    @UserProtected()
    @AuthJwtAccessProtected()
    @Put('/update/claim-username')
    async updateUsername(
        @AuthJwtPayload('user', UserParsePipe) user: UserDoc,
        @Body()
        { username }: UserUpdateClaimUsernameRequestDto
    ): Promise<void> {
        const checkUsername = this.userService.checkUsernamePattern(username);
        if (checkUsername) {
            throw new BadRequestException({
                statusCode: ENUM_USER_STATUS_CODE_ERROR.USERNAME_NOT_ALLOWED,
                message: 'user.error.usernameNotAllowed',
            });
        }

        const checkBadWord =
            await this.userService.checkUsernameBadWord(username);
        if (checkBadWord) {
            throw new BadRequestException({
                statusCode:
                    ENUM_USER_STATUS_CODE_ERROR.USERNAME_CONTAIN_BAD_WORD,
                message: 'user.error.usernameContainBadWord',
            });
        }

        const exist = await this.userService.existByUsername(username);
        if (exist) {
            throw new ConflictException({
                statusCode: ENUM_USER_STATUS_CODE_ERROR.USERNAME_EXIST,
                message: 'user.error.usernameExist',
            });
        }

        const session: ClientSession =
            await this.databaseConnection.startSession();
        session.startTransaction();

        try {
            await this.userService.updateClaimUsername(
                user,
                { username },
                { session }
            );

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
