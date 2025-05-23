import { Injectable } from '@nestjs/common';
import {
    IDatabaseAggregateOptions,
    IDatabaseCreateOptions,
    IDatabaseDeleteManyOptions,
    IDatabaseExistsOptions,
    IDatabaseFindAllAggregateOptions,
    IDatabaseFindAllOptions,
    IDatabaseFindOneOptions,
    IDatabaseGetTotalOptions,
    IDatabaseSaveOptions,
    IDatabaseUpdateOptions,
} from 'src/common/database/interfaces/database.interface';
import { HelperDateService } from 'src/common/helper/services/helper.date.service';
import { ConfigService } from '@nestjs/config';
import { IAuthPassword } from 'src/modules/auth/interfaces/auth.interface';
import { plainToInstance } from 'class-transformer';
import { Document, PipelineStage, Types } from 'mongoose';
import { IUserService } from 'src/modules/user/interfaces/user.service.interface';
import { UserRepository } from 'src/modules/user/repository/repositories/user.repository';
import {
    UserDoc,
    UserEntity,
} from 'src/modules/user/repository/entities/user.entity';
import {
    IUserDoc,
    IUserEntity,
} from 'src/modules/user/interfaces/user.interface';
import {
    ENUM_USER_SIGN_UP_FROM,
    ENUM_USER_STATUS,
} from 'src/modules/user/enums/user.enum';
import { UserCreateRequestDto } from 'src/modules/user/dtos/request/user.create.request.dto';
import { UserUpdatePasswordAttemptRequestDto } from 'src/modules/user/dtos/request/user.update-password-attempt.request.dto';
import { UserUpdateRequestDto } from 'src/modules/user/dtos/request/user.update.request.dto';
import { UserProfileResponseDto } from 'src/modules/user/dtos/response/user.profile.response.dto';
import { UserListResponseDto } from 'src/modules/user/dtos/response/user.list.response.dto';
import { UserShortResponseDto } from 'src/modules/user/dtos/response/user.short.response.dto';
import { UserGetResponseDto } from 'src/modules/user/dtos/response/user.get.response.dto';
import { HelperStringService } from 'src/common/helper/services/helper.string.service';
import { AuthSignUpRequestDto } from 'src/modules/auth/dtos/request/auth.sign-up.request.dto';
import { UserUpdateClaimUsernameRequestDto } from 'src/modules/user/dtos/request/user.update-claim-username.dto';
import { DatabaseSoftDeleteDto } from 'src/common/database/dtos/database.soft-delete.dto';
import { UserUpdateProfileRequestDto } from 'src/modules/user/dtos/request/user.update-profile.dto';

import { RoleTableName } from 'src/modules/role/repository/entities/role.entity';
import { UserUpdateStatusRequestDto } from 'src/modules/user/dtos/request/user.update-status.request.dto';
import { DatabaseHelperQueryContain } from 'src/common/database/decorators/database.decorator';
import { UserUploadPhotoRequestDto } from 'src/modules/user/dtos/request/user.upload-photo.request.dto';

@Injectable()
export class UserService implements IUserService {
    private readonly usernamePrefix: string;
    private readonly usernamePattern: RegExp;
    private readonly uploadPath: string;

    constructor(
        private readonly userRepository: UserRepository,
        private readonly helperDateService: HelperDateService,
        private readonly configService: ConfigService,
        private readonly helperStringService: HelperStringService
    ) {
        this.usernamePrefix = this.configService.get<string>(
            'user.usernamePrefix'
        );
        this.usernamePattern = this.configService.get<RegExp>(
            'user.usernamePattern'
        );
        this.uploadPath = this.configService.get<string>('user.uploadPath');
    }

    async findAll(
        find?: Record<string, any>,
        options?: IDatabaseFindAllOptions
    ): Promise<UserDoc[]> {
        return this.userRepository.findAll<UserDoc>(find, options);
    }

    async getTotal(
        find?: Record<string, any>,
        options?: IDatabaseGetTotalOptions
    ): Promise<number> {
        return this.userRepository.getTotal(find, options);
    }

    createRawQueryFindAllWithRole(find?: Record<string, any>): PipelineStage[] {
        return [
            {
                $lookup: {
                    from: RoleTableName,
                    as: 'role',
                    foreignField: '_id',
                    localField: 'role',
                },
            },
            {
                $unwind: '$role',
            },
            {
                $match: find,
            },
        ];
    }

    async findAllWithRole(
        find?: Record<string, any>,
        options?: IDatabaseFindAllAggregateOptions
    ): Promise<IUserEntity[]> {
        const pipeline: PipelineStage[] =
            this.createRawQueryFindAllWithRole(find);

        return this.userRepository.findAllAggregate<PipelineStage, IUserEntity>(
            pipeline,
            options
        );
    }

    async getTotalWithRole(
        find?: Record<string, any>,
        options?: IDatabaseAggregateOptions
    ): Promise<number> {
        const pipeline: PipelineStage[] =
            this.createRawQueryFindAllWithRole(find);

        return this.userRepository.getTotalAggregate<PipelineStage>(
            pipeline,
            options
        );
    }

    async findOneById(
        _id: string,
        options?: IDatabaseFindOneOptions
    ): Promise<UserDoc> {
        return this.userRepository.findOneById<UserDoc>(_id, options);
    }

    async findOne(
        find: Record<string, any>,
        options?: IDatabaseFindOneOptions
    ): Promise<UserDoc> {
        return this.userRepository.findOne<UserDoc>(find, options);
    }

    async findOneByEmail(
        email: string,
        options?: IDatabaseFindOneOptions
    ): Promise<UserDoc> {
        return this.userRepository.findOne<UserDoc>(
            DatabaseHelperQueryContain('email', email, { fullWord: true }),
            options
        );
    }

    async findOneWithRole(
        find?: Record<string, any>,
        options?: IDatabaseFindOneOptions
    ): Promise<IUserDoc> {
        return this.userRepository.findOne<IUserDoc>(find, {
            ...options,
            join: true,
        });
    }

    async findOneWithRoleById(
        _id: string,
        options?: IDatabaseFindOneOptions
    ): Promise<IUserDoc> {
        return this.userRepository.findOneById<IUserDoc>(_id, {
            ...options,
            join: true,
        });
    }

    async findAllActiveWithRole(
        find?: Record<string, any>,
        options?: IDatabaseFindAllOptions
    ): Promise<IUserDoc[]> {
        return this.userRepository.findAll<IUserDoc>(
            { ...find, status: ENUM_USER_STATUS.ACTIVE },
            {
                ...options,
                join: this.userRepository._joinActive,
            }
        );
    }

    async getTotalActive(
        find?: Record<string, any>,
        options?: IDatabaseGetTotalOptions
    ): Promise<number> {
        return this.userRepository.getTotal(
            { ...find, status: ENUM_USER_STATUS.ACTIVE },
            {
                ...options,
                join: this.userRepository._joinActive,
            }
        );
    }

    async findOneActiveById(
        _id: string,
        options?: IDatabaseFindOneOptions
    ): Promise<IUserDoc> {
        return this.userRepository.findOne<IUserDoc>(
            { _id, status: ENUM_USER_STATUS.ACTIVE },
            {
                ...options,
                join: this.userRepository._joinActive,
            }
        );
    }

    async findOneActiveByEmail(
        email: string,
        options?: IDatabaseFindOneOptions
    ): Promise<IUserDoc> {
        return this.userRepository.findOne<IUserDoc>(
            { email, status: ENUM_USER_STATUS.ACTIVE },
            {
                ...options,
                join: this.userRepository._joinActive,
            }
        );
    }

    async create(
        { email, name, role, gender }: UserCreateRequestDto,
        { passwordExpired, passwordHash, salt, passwordCreated }: IAuthPassword,
        signUpFrom: ENUM_USER_SIGN_UP_FROM,
        options?: IDatabaseCreateOptions
    ): Promise<UserDoc> {
        const username = this.createRandomUsername();

        const create: UserEntity = new UserEntity();
        create.name = name;
        create.email = email;
        create.role = role;
        create.gender = gender;
        create.status = ENUM_USER_STATUS.ACTIVE;
        create.password = passwordHash;
        create.salt = salt;
        create.passwordExpired = passwordExpired;
        create.passwordCreated = passwordCreated;
        create.passwordAttempt = 0;
        create.signUpDate = this.helperDateService.create();
        create.signUpFrom = signUpFrom;
        create.username = username;
        create.verification = {
            email: false,
        };

        return this.userRepository.create<UserEntity>(create, options);
    }

    async signUp(
        role: string,
        { email, name }: AuthSignUpRequestDto,
        { passwordExpired, passwordHash, salt, passwordCreated }: IAuthPassword,
        options?: IDatabaseCreateOptions
    ): Promise<UserDoc> {
        const username = this.createRandomUsername();

        const create: UserEntity = new UserEntity();
        create.name = name;
        create.email = email;
        create.role = role;
        create.status = ENUM_USER_STATUS.ACTIVE;
        create.password = passwordHash;
        create.salt = salt;
        create.passwordExpired = passwordExpired;
        create.passwordCreated = passwordCreated;
        create.passwordAttempt = 0;
        create.signUpDate = this.helperDateService.create();
        create.signUpFrom = ENUM_USER_SIGN_UP_FROM.PUBLIC;
        create.username = username;
        create.verification = {
            email: false,
        };

        return this.userRepository.create<UserEntity>(create, options);
    }

    async existByRole(
        role: string,
        options?: IDatabaseExistsOptions
    ): Promise<boolean> {
        return this.userRepository.exists(
            {
                role,
            },
            options
        );
    }

    async existByEmail(
        email: string,
        options?: IDatabaseExistsOptions
    ): Promise<boolean> {
        return this.userRepository.exists(
            DatabaseHelperQueryContain('email', email, { fullWord: true }),
            options
        );
    }

    async existByUsername(
        username: string,
        options?: IDatabaseExistsOptions
    ): Promise<boolean> {
        return this.userRepository.exists(
            DatabaseHelperQueryContain('username', username, {
                fullWord: true,
            }),
            options
        );
    }

    async updatePassword(
        repository: UserDoc,
        { passwordHash, passwordExpired, salt, passwordCreated }: IAuthPassword,
        options?: IDatabaseSaveOptions
    ): Promise<UserDoc> {
        repository.password = passwordHash;
        repository.passwordExpired = passwordExpired;
        repository.passwordCreated = passwordCreated;
        repository.salt = salt;
        repository.passwordAttempt = 0;

        return this.userRepository.save(repository, options);
    }

    async updateStatus(
        repository: UserDoc,
        { status }: UserUpdateStatusRequestDto,
        options?: IDatabaseSaveOptions
    ): Promise<UserEntity> {
        repository.status = status;

        return this.userRepository.save(repository, options);
    }

    async updatePasswordAttempt(
        repository: UserDoc,
        { passwordAttempt }: UserUpdatePasswordAttemptRequestDto,
        options?: IDatabaseSaveOptions
    ): Promise<UserDoc> {
        repository.passwordAttempt = passwordAttempt;

        return this.userRepository.save(repository, options);
    }

    async increasePasswordAttempt(
        repository: UserDoc,
        options?: IDatabaseUpdateOptions
    ): Promise<UserDoc> {
        return this.userRepository.update(
            { _id: repository._id },
            {
                $inc: {
                    passwordAttempt: 1,
                },
            },
            options
        );
    }

    async resetPasswordAttempt(
        repository: UserDoc,
        options?: IDatabaseSaveOptions
    ): Promise<UserDoc> {
        repository.passwordAttempt = 0;

        return this.userRepository.save(repository, options);
    }

    async updatePasswordExpired(
        repository: UserDoc,
        passwordExpired: Date,
        options?: IDatabaseSaveOptions
    ): Promise<UserDoc> {
        repository.passwordExpired = passwordExpired;

        return this.userRepository.save(repository, options);
    }

    async update(
        repository: UserDoc,
        { name, role, gender }: UserUpdateRequestDto,
        options?: IDatabaseSaveOptions
    ): Promise<UserDoc> {
        repository.name = name;
        repository.role = role;
        repository.gender = gender;

        return this.userRepository.save(repository, options);
    }

    async updateClaimUsername(
        repository: UserDoc,
        { username }: UserUpdateClaimUsernameRequestDto,
        options?: IDatabaseSaveOptions
    ): Promise<UserDoc> {
        repository.username = username;

        return this.userRepository.save(repository, options);
    }

    async softDelete(
        repository: UserDoc,
        dto: DatabaseSoftDeleteDto,
        options?: IDatabaseSaveOptions
    ): Promise<UserDoc> {
        return this.userRepository.softDelete(repository, dto, options);
    }

    async deleteMany(
        find: Record<string, any>,
        options?: IDatabaseDeleteManyOptions
    ): Promise<boolean> {
        await this.userRepository.deleteMany(find, options);

        return true;
    }

    async updateProfile(
        repository: UserDoc,
        { name, gender }: UserUpdateProfileRequestDto,
        options?: IDatabaseSaveOptions
    ): Promise<UserDoc> {
        repository.name = name;
        repository.gender = gender;

        return this.userRepository.save(repository, options);
    }

    async updateVerificationEmail(
        email: string,
        options?: IDatabaseSaveOptions
    ): Promise<void> {
        const repository = await this.findOneByEmail(email);
        repository.verification.email = true;
        repository.verification.emailVerifiedDate =
            this.helperDateService.create();

        await this.userRepository.save(repository, options);
    }

    async join(repository: UserDoc): Promise<IUserDoc> {
        return this.userRepository.join(repository, this.userRepository._join);
    }

    createRandomFilenamePhoto(
        user: string,
        { type }: UserUploadPhotoRequestDto
    ): string {
        const path: string = this.uploadPath.replace('{user}', user);
        const randomPath = this.helperStringService.random(10);

        return `${path}/${randomPath}.${type.toLowerCase()}`;
    }

    createRandomUsername(): string {
        const suffix = this.helperStringService.random(6);

        return `${this.usernamePrefix}-${suffix}`;
    }

    checkUsernamePattern(username: string): boolean {
        return !!username.search(this.usernamePattern);
    }

    async checkUsernameBadWord(username: string): Promise<boolean> {
        const filterBadWordModule = await import('bad-words');
        const filterBadWord = new filterBadWordModule.Filter();
        return filterBadWord.isProfane(username);
    }

    mapProfile(user: IUserDoc | IUserEntity): UserProfileResponseDto {
        return plainToInstance(
            UserProfileResponseDto,
            user instanceof Document ? user.toObject() : user
        );
    }

    mapList(users: IUserDoc[] | IUserEntity[]): UserListResponseDto[] {
        return plainToInstance(
            UserListResponseDto,
            users.map((u: IUserDoc | IUserEntity) =>
                u instanceof Document ? u.toObject() : u
            )
        );
    }

    mapShort(users: IUserDoc[] | IUserEntity[]): UserShortResponseDto[] {
        return plainToInstance(
            UserShortResponseDto,
            users.map((u: IUserDoc | IUserEntity) =>
                u instanceof Document ? u.toObject() : u
            )
        );
    }

    mapGet(user: IUserDoc | IUserEntity): UserGetResponseDto {
        return plainToInstance(
            UserGetResponseDto,
            user instanceof Document ? user.toObject() : user
        );
    }
}
