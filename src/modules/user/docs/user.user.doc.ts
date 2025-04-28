import { applyDecorators } from '@nestjs/common';
import {
    Doc,
    DocAuth,
    DocGuard,
    DocRequest,
    DocResponse,
} from 'src/common/doc/decorators/doc.decorator';
import { ENUM_DOC_REQUEST_BODY_TYPE } from 'src/common/doc/enums/doc.enum';
import { UserUpdateClaimUsernameRequestDto } from 'src/modules/user/dtos/request/user.update-claim-username.dto';

export function UserUserDeleteDoc(): MethodDecorator {
    return applyDecorators(
        Doc({
            summary: 'user delete their account',
        }),

        DocGuard({ role: true }),
        DocResponse('user.delete')
    );
}

export function UserUserUpdateUsernameDoc(): MethodDecorator {
    return applyDecorators(
        Doc({
            summary: 'user update username',
        }),
        DocRequest({
            bodyType: ENUM_DOC_REQUEST_BODY_TYPE.JSON,
            dto: UserUpdateClaimUsernameRequestDto,
        }),
        DocAuth({
            jwtAccessToken: true,
        }),
        DocGuard({ role: true }),
        DocResponse('user.updateClaimUsername')
    );
}
