import { applyDecorators } from '@nestjs/common';
import {
    Doc,
    DocRequest,
    DocResponse,
} from 'src/common/doc/decorators/doc.decorator';
import {
    ForecastDocParamsId,
    ForecastDocQueryDays,
} from 'src/modules/weather/constants/forecast.doc.constant';
import { ForecastResponseDto } from 'src/modules/weather/dtos/response/forecast.response.dto';
export function ForecastDoc(): MethodDecorator {
    return applyDecorators(
        Doc({
            summary: 'get weather forecast',
        }),
        DocRequest({
            queries: ForecastDocQueryDays,
            params: ForecastDocParamsId,
        }),
        DocResponse<ForecastResponseDto>('weather.forecast', {
            dto: ForecastResponseDto,
        })
    );
}
