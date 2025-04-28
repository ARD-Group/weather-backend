import { Command } from 'nestjs-command';
import { Injectable } from '@nestjs/common';
import { AuthService } from 'src/modules/auth/services/auth.service';
import { UserService } from 'src/modules/user/services/user.service';
import { RoleDoc } from 'src/modules/role/repository/entities/role.entity';
import { RoleService } from 'src/modules/role/services/role.service';
import {
    ENUM_USER_GENDER,
    ENUM_USER_SIGN_UP_FROM,
} from 'src/modules/user/enums/user.enum';

@Injectable()
export class MigrationUserSeed {
    constructor(
        private readonly authService: AuthService,
        private readonly userService: UserService,
        private readonly roleService: RoleService
    ) {}

    @Command({
        command: 'seed:user',
        describe: 'seed users',
    })
    async seeds(): Promise<void> {
        const password = 'aaAA@123';
        const passwordHash = await this.authService.createPassword(password);
        const superAdminRole: RoleDoc =
            await this.roleService.findOneByName('superadmin');
        const adminRole: RoleDoc =
            await this.roleService.findOneByName('admin');

        const individualRole: RoleDoc =
            await this.roleService.findOneByName('individual');
        const premiumRole: RoleDoc =
            await this.roleService.findOneByName('premium');
        const businessRole: RoleDoc =
            await this.roleService.findOneByName('business');

        try {
            const [superAdmin, admin, individual, premium, business] =
                await Promise.all([
                    this.userService.create(
                        {
                            role: superAdminRole._id,
                            name: 'superadmin',
                            email: 'superadmin@mail.com',
                            gender: ENUM_USER_GENDER.MALE,
                        },
                        passwordHash,
                        ENUM_USER_SIGN_UP_FROM.SEED
                    ),
                    this.userService.create(
                        {
                            role: adminRole._id,
                            name: 'admin',
                            email: 'admin@mail.com',
                            gender: ENUM_USER_GENDER.MALE,
                        },
                        passwordHash,
                        ENUM_USER_SIGN_UP_FROM.SEED
                    ),
                    this.userService.create(
                        {
                            role: individualRole._id,
                            name: 'individual',
                            email: 'individual@mail.com',
                            gender: ENUM_USER_GENDER.MALE,
                        },
                        passwordHash,
                        ENUM_USER_SIGN_UP_FROM.SEED
                    ),
                    this.userService.create(
                        {
                            role: premiumRole._id,
                            name: 'premium',
                            email: 'premium@mail.com',
                            gender: ENUM_USER_GENDER.MALE,
                        },
                        passwordHash,
                        ENUM_USER_SIGN_UP_FROM.SEED
                    ),
                    this.userService.create(
                        {
                            role: premiumRole._id,
                            name: 'premium',
                            email: 'premium@mail.com',
                            gender: ENUM_USER_GENDER.MALE,
                        },
                        passwordHash,
                        ENUM_USER_SIGN_UP_FROM.SEED
                    ),
                    this.userService.create(
                        {
                            role: businessRole._id,
                            name: 'business',
                            email: 'business@mail.com',
                            gender: ENUM_USER_GENDER.MALE,
                        },
                        passwordHash,
                        ENUM_USER_SIGN_UP_FROM.SEED
                    ),
                ]);
        } catch (err: any) {
            console.error('err', err);
            throw new Error(err);
        }

        return;
    }

    @Command({
        command: 'remove:user',
        describe: 'remove users',
    })
    async remove(): Promise<void> {
        try {
            await this.userService.deleteMany({});
        } catch (err: any) {
            throw new Error(err);
        }

        return;
    }
}
