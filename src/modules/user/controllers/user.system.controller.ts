import {
    BadRequestException,
    Body,
    ConflictException,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
    PaginationQuery,
    PaginationQueryFilterEqual,
    PaginationQueryFilterInEnum,
} from 'src/common/pagination/decorators/pagination.decorator';
import { PaginationListDto } from 'src/common/pagination/dtos/pagination.list.dto';
import { PaginationService } from 'src/common/pagination/services/pagination.service';
import {
    Response,
    ResponsePaging,
} from 'src/common/response/decorators/response.decorator';
import {
    IResponse,
    IResponsePaging,
} from 'src/common/response/interfaces/response.interface';
import { ENUM_POLICY_ROLE_TYPE } from 'src/modules/policy/enums/policy.enum';
import {
    USER_DEFAULT_AVAILABLE_SEARCH,
    USER_DEFAULT_POLICY_ROLE_TYPE,
    USER_DEFAULT_STATUS,
} from 'src/modules/user/constants/user.list.constant';
import {
    UserSystemCheckEmailDoc,
    UserSystemCheckUsernameDoc,
    UserSystemListDoc,
} from 'src/modules/user/docs/user.system.doc';
import {
    UserCheckEmailRequestDto,
    UserCheckUsernameRequestDto,
} from 'src/modules/user/dtos/request/user.check.request.dto';
import { UserCheckResponseDto } from 'src/modules/user/dtos/response/user.check.response.dto';
import { UserShortResponseDto } from 'src/modules/user/dtos/response/user.short.response.dto';
import { ENUM_USER_STATUS } from 'src/modules/user/enums/user.enum';
import { ENUM_USER_STATUS_CODE_ERROR } from 'src/modules/user/enums/user.status-code.enum';
import { IUserEntity } from 'src/modules/user/interfaces/user.interface';
import { UserService } from 'src/modules/user/services/user.service';

@ApiTags('modules.system.user')
@Controller({
    version: '1',
    path: '/user',
})
export class UserSystemController {
    constructor(
        private readonly paginationService: PaginationService,
        private readonly userService: UserService
    ) {}

    @UserSystemListDoc()
    @ResponsePaging('user.list')
    @Get('/list')
    async list(
        @PaginationQuery({ availableSearch: USER_DEFAULT_AVAILABLE_SEARCH })
        { _search, _limit, _offset, _order }: PaginationListDto,
        @PaginationQueryFilterInEnum(
            'status',
            USER_DEFAULT_STATUS,
            ENUM_USER_STATUS
        )
        status: Record<string, any>,
        @PaginationQueryFilterInEnum(
            'role.type',
            USER_DEFAULT_POLICY_ROLE_TYPE,
            ENUM_POLICY_ROLE_TYPE,
            {
                queryField: 'roleType',
            }
        )
        roleType: Record<string, any>
    ): Promise<IResponsePaging<UserShortResponseDto>> {
        const find: Record<string, any> = {
            ..._search,
            ...roleType,
            ...status,
        };

        const users: IUserEntity[] = await this.userService.findAllWithRole(
            find,
            {
                paging: {
                    limit: _limit,
                    offset: _offset,
                },
                order: _order,
            }
        );

        const total: number = await this.userService.getTotalWithRole(find);
        const totalPage: number = this.paginationService.totalPage(
            total,
            _limit
        );
        const mapUsers: UserShortResponseDto[] =
            this.userService.mapShort(users);

        return {
            _pagination: { total, totalPage },
            data: mapUsers,
        };
    }

    @UserSystemCheckUsernameDoc()
    @Response('user.checkUsername')
    @HttpCode(HttpStatus.OK)
    @Post('/check/username')
    async checkUsername(
        @Body() { username }: UserCheckUsernameRequestDto
    ): Promise<IResponse<UserCheckResponseDto>> {
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

        return {
            data: { passed: true },
        };
    }

    @UserSystemCheckEmailDoc()
    @Response('user.checkEmail')
    @HttpCode(HttpStatus.OK)
    @Post('/check/email')
    async checkEmail(
        @Body() { email }: UserCheckEmailRequestDto
    ): Promise<IResponse<UserCheckResponseDto>> {
        const exist: boolean = await this.userService.existByEmail(email);
        if (exist) {
            throw new ConflictException({
                statusCode: ENUM_USER_STATUS_CODE_ERROR.EMAIL_EXIST,
                message: 'user.error.emailExist',
            });
        }

        return {
            data: { passed: true },
        };
    }
}
