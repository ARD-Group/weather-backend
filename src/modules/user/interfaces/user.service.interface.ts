import { IAuthPassword } from 'src/modules/auth/interfaces/auth.interface';
import {
    IDatabaseCreateOptions,
    IDatabaseDeleteManyOptions,
    IDatabaseExistsOptions,
    IDatabaseFindAllOptions,
    IDatabaseGetTotalOptions,
    IDatabaseOptions,
    IDatabaseSaveOptions,
    IDatabaseUpdateOptions,
} from 'src/common/database/interfaces/database.interface';
import {
    UserDoc,
    UserEntity,
} from 'src/modules/user/repository/entities/user.entity';

import { UserUpdatePasswordAttemptRequestDto } from 'src/modules/user/dtos/request/user.update-password-attempt.request.dto';
import { ENUM_USER_SIGN_UP_FROM } from 'src/modules/user/enums/user.enum';
import { UserCreateRequestDto } from 'src/modules/user/dtos/request/user.create.request.dto';
import { UserUpdateRequestDto } from 'src/modules/user/dtos/request/user.update.request.dto';

import { AuthSignUpRequestDto } from 'src/modules/auth/dtos/request/auth.sign-up.request.dto';
import { UserUpdateClaimUsernameRequestDto } from 'src/modules/user/dtos/request/user.update-claim-username.dto';
import { DatabaseSoftDeleteDto } from 'src/common/database/dtos/database.soft-delete.dto';
import { UserUpdateProfileRequestDto } from 'src/modules/user/dtos/request/user.update-profile.dto';
import { UserUpdateStatusRequestDto } from 'src/modules/user/dtos/request/user.update-status.request.dto';
import { PipelineStage } from 'mongoose';
import { UserUploadPhotoRequestDto } from 'src/modules/user/dtos/request/user.upload-photo.request.dto';

export interface IUserService {
    findAll(
        find?: Record<string, any>,
        options?: IDatabaseFindAllOptions
    ): Promise<UserDoc[]>;
    getTotal(
        find?: Record<string, any>,
        options?: IDatabaseGetTotalOptions
    ): Promise<number>;
    createRawQueryFindAllWithRole(find?: Record<string, any>): PipelineStage[];

    findOneById(_id: string, options?: IDatabaseOptions): Promise<UserDoc>;
    findOne(
        find: Record<string, any>,
        options?: IDatabaseOptions
    ): Promise<UserDoc>;
    findOneByEmail(email: string, options?: IDatabaseOptions): Promise<UserDoc>;

    getTotalActive(
        find?: Record<string, any>,
        options?: IDatabaseGetTotalOptions
    ): Promise<number>;

    create(
        { email, name, role }: UserCreateRequestDto,
        { passwordExpired, passwordHash, salt, passwordCreated }: IAuthPassword,
        signUpFrom: ENUM_USER_SIGN_UP_FROM,
        options?: IDatabaseCreateOptions
    ): Promise<UserDoc>;
    signUp(
        role: string,
        { email, name }: AuthSignUpRequestDto,
        { passwordExpired, passwordHash, salt, passwordCreated }: IAuthPassword,
        options?: IDatabaseCreateOptions
    ): Promise<UserDoc>;
    existByRole(
        role: string,
        options?: IDatabaseExistsOptions
    ): Promise<boolean>;
    existByEmail(
        email: string,
        options?: IDatabaseExistsOptions
    ): Promise<boolean>;
    existByUsername(
        username: string,
        options?: IDatabaseExistsOptions
    ): Promise<boolean>;

    updatePassword(
        repository: UserDoc,
        { passwordHash, passwordExpired, salt, passwordCreated }: IAuthPassword,
        options?: IDatabaseSaveOptions
    ): Promise<UserDoc>;
    updateStatus(
        repository: UserDoc,
        { status }: UserUpdateStatusRequestDto,
        options?: IDatabaseSaveOptions
    ): Promise<UserEntity>;
    updatePasswordAttempt(
        repository: UserDoc,
        { passwordAttempt }: UserUpdatePasswordAttemptRequestDto,
        options?: IDatabaseSaveOptions
    ): Promise<UserDoc>;
    increasePasswordAttempt(
        repository: UserDoc,
        options?: IDatabaseUpdateOptions
    ): Promise<UserDoc>;
    resetPasswordAttempt(
        repository: UserDoc,
        options?: IDatabaseSaveOptions
    ): Promise<UserDoc>;
    updatePasswordExpired(
        repository: UserDoc,
        passwordExpired: Date,
        options?: IDatabaseSaveOptions
    ): Promise<UserDoc>;
    update(
        repository: UserDoc,
        { name, role }: UserUpdateRequestDto,
        options?: IDatabaseSaveOptions
    ): Promise<UserDoc>;

    updateClaimUsername(
        repository: UserDoc,
        { username }: UserUpdateClaimUsernameRequestDto,
        options?: IDatabaseSaveOptions
    ): Promise<UserDoc>;

    softDelete(
        repository: UserDoc,
        dto: DatabaseSoftDeleteDto,
        options?: IDatabaseSaveOptions
    ): Promise<UserDoc>;
    deleteMany(
        find: Record<string, any>,
        options?: IDatabaseDeleteManyOptions
    ): Promise<boolean>;
    updateProfile(
        repository: UserDoc,
        { name, gender }: UserUpdateProfileRequestDto,
        options?: IDatabaseSaveOptions
    ): Promise<UserDoc>;
    updateVerificationEmail(
        repository: UserDoc,
        options?: IDatabaseSaveOptions
    ): Promise<UserDoc>;

    createRandomFilenamePhoto(
        user: string,
        { type }: UserUploadPhotoRequestDto
    ): string;
    createRandomUsername(): string;
    checkUsernamePattern(username: string): boolean;
    checkUsernameBadWord(username: string): Promise<boolean>;
}
