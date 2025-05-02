import { Module } from '@nestjs/common';
import { CommandModule } from 'nestjs-command';
import { CommonModule } from 'src/common/common.module';
import { MigrationRoleSeed } from 'src/migration/seeds/migration.role.seed';
import { MigrationTemplateSeed } from 'src/migration/seeds/migration.template.seed';
import { MigrationUserSeed } from 'src/migration/seeds/migration.user.seed';
import { AuthModule } from 'src/modules/auth/auth.module';
import { EmailModule } from 'src/modules/email/email.module';
import { RoleModule } from 'src/modules/role/role.module';
import { UserModule } from 'src/modules/user/user.module';

@Module({
    imports: [
        CommonModule,
        CommandModule,
        EmailModule,
        AuthModule,
        RoleModule,
        UserModule,
    ],
    providers: [MigrationUserSeed, MigrationRoleSeed, MigrationTemplateSeed],
    exports: [],
})
export class MigrationModule {}
