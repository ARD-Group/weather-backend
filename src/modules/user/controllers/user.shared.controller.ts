import {
    Body,
    Controller,
    Get,
    InternalServerErrorException,
    Put,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
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

import { UserProtected } from 'src/modules/user/decorators/user.decorator';
import {
    UserSharedProfileDoc,
    UserSharedUpdateProfileDoc,
} from 'src/modules/user/docs/user.shared.doc';
import { UserUpdateProfileRequestDto } from 'src/modules/user/dtos/request/user.update-profile.dto';
import { UserProfileResponseDto } from 'src/modules/user/dtos/response/user.profile.response.dto';
import { IUserDoc } from 'src/modules/user/interfaces/user.interface';
import {
    UserActiveParsePipe,
    UserParsePipe,
} from 'src/modules/user/pipes/user.parse.pipe';
import { UserDoc } from 'src/modules/user/repository/entities/user.entity';
import { UserService } from 'src/modules/user/services/user.service';

@ApiTags('modules.shared.user')
@Controller({
    version: '1',
    path: '/user',
})
export class UserSharedController {
    constructor(
        @InjectDatabaseConnection()
        private readonly databaseConnection: Connection,
        private readonly userService: UserService
    ) {}

    @UserSharedProfileDoc()
    @Response('user.profile')
    @UserProtected()
    @AuthJwtAccessProtected()
    @Get('/profile')
    async profile(
        @AuthJwtPayload<AuthJwtAccessPayloadDto>('user', UserActiveParsePipe)
        user: IUserDoc
    ): Promise<IResponse<UserProfileResponseDto>> {
        const mapped: UserProfileResponseDto =
            this.userService.mapProfile(user);
        return { data: mapped };
    }

    @UserSharedUpdateProfileDoc()
    @Response('user.updateProfile')
    @UserProtected()
    @AuthJwtAccessProtected()
    @Put('/profile/update')
    async updateProfile(
        @AuthJwtPayload<AuthJwtAccessPayloadDto>('user', UserParsePipe)
        user: UserDoc,
        @Body()
        { ...body }: UserUpdateProfileRequestDto
    ): Promise<void> {
        const session: ClientSession =
            await this.databaseConnection.startSession();
        session.startTransaction();

        try {
            await this.userService.updateProfile(
                user,
                { ...body },
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
