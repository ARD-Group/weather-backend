import { applyDecorators } from '@nestjs/common';
import {
    Doc,
    DocRequest,
    DocResponse,
} from 'src/common/doc/decorators/doc.decorator';
import { SearchResponseDto } from 'src/modules/weather/dtos/response/search.response.dto';
import { SearchDocQueryQ } from 'src/modules/weather/constants/search.doc.constant';

export function SearchDoc(): MethodDecorator {
    return applyDecorators(
        Doc({
            summary: 'search',
        }),

        DocRequest({
            queries: SearchDocQueryQ,
        }),
        DocResponse<SearchResponseDto>('weather.search', {
            dto: SearchResponseDto,
        })
    );
}
