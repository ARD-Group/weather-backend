import { applyDecorators } from '@nestjs/common';
import {
    Doc,
    DocAuth,
    DocRequest,
    DocResponsePaging,
} from 'src/common/doc/decorators/doc.decorator';
import { RoleDocQueryType } from 'src/modules/role/constants/role.doc.constant';
import { RoleShortResponseDto } from 'src/modules/role/dtos/response/role.short.response.dto';

export function RoleSystemListDoc(): MethodDecorator {
    return applyDecorators(
        Doc({
            summary: 'get all of roles',
        }),
        DocRequest({
            queries: RoleDocQueryType,
        }),

        DocResponsePaging<RoleShortResponseDto>('role.list', {
            dto: RoleShortResponseDto,
        })
    );
}
