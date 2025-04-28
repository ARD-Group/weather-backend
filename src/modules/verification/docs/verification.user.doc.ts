import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
    Doc,
    DocAuth,
    DocGuard,
    DocRequest,
    DocResponse,
} from 'src/common/doc/decorators/doc.decorator';
import { ENUM_DOC_REQUEST_BODY_TYPE } from 'src/common/doc/enums/doc.enum';
import { VerificationVerifyRequestDto } from 'src/modules/verification/dtos/request/verification.verify.request.dto';
import { VerificationResponse } from 'src/modules/verification/dtos/response/verification.response';

export function VerificationUserGetEmailDoc(): MethodDecorator {
    return applyDecorators(
        Doc({
            summary: 'get active email verification',
        }),
        DocAuth({
            jwtAccessToken: true,
        }),
        DocGuard({ role: true }),
        DocResponse<VerificationResponse>('verification.getEmail', {
            dto: VerificationResponse,
        })
    );
}

export function VerificationUserResendEmailDoc(): MethodDecorator {
    return applyDecorators(
        Doc({
            summary: 'request otp email verification',
        }),
        DocAuth({
            jwtAccessToken: true,
        }),
        DocGuard({ role: true }),
        DocResponse<VerificationResponse>('verification.requestEmail', {
            dto: VerificationResponse,
            httpStatus: HttpStatus.CREATED,
        })
    );
}

export function VerificationUserVerifyEmailDoc(): MethodDecorator {
    return applyDecorators(
        Doc({
            summary: 'verify user email',
        }),
        DocAuth({
            jwtAccessToken: true,
        }),
        DocRequest({
            bodyType: ENUM_DOC_REQUEST_BODY_TYPE.JSON,
            dto: VerificationVerifyRequestDto,
        }),
        DocGuard({ role: true }),
        DocResponse('verification.verifyEmail')
    );
}
