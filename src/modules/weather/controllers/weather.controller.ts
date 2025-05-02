import { Controller, Get, Query, Param } from '@nestjs/common';
import { WeatherService } from '../services/weather.service';
import { ForecastRequestDto } from 'src/modules/weather/dtos/request/forecast.request.dto';
import { SearchRequestDto } from 'src/modules/weather/dtos/request/search.request.dto';
import { ApiTags } from '@nestjs/swagger';
import { ForecastDoc } from 'src/modules/weather/docs/forecast.doc';
import { SearchDoc } from 'src/modules/weather/docs/search.doc';
import { Response } from 'src/common/response/decorators/response.decorator';
import { IResponse } from 'src/common/response/interfaces/response.interface';
import { ForecastResponseDto } from 'src/modules/weather/dtos/response/forecast.response.dto';
import { SearchResponseDto } from 'src/modules/weather/dtos/response/search.response.dto';
import { LocationRequestDto } from 'src/modules/weather/dtos/request/location.request.dto';
@ApiTags('modules.weather')
@Controller({
    version: '1',
    path: '/weather',
})
export class WeatherController {
    constructor(private readonly weatherService: WeatherService) {}

    @ForecastDoc()
    @Response('weather.forecast')
    @Get('forecast/:location')
    async getForecast(
        @Param() params: LocationRequestDto,
        @Query() query: ForecastRequestDto
    ): Promise<IResponse<ForecastResponseDto>> {
        const forecast = await this.weatherService.getForecast(
            params.location,
            query.days || 5
        );
        return {
            data: forecast,
        };
    }

    @SearchDoc()
    @Response('weather.search')
    @Get('search')
    async searchLocations(
        @Query() query: SearchRequestDto
    ): Promise<IResponse<SearchResponseDto[]>> {
        const search = await this.weatherService.searchLocations(query.q);
        return {
            data: search,
        };
    }
}
