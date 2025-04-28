import { Module } from '@nestjs/common';
import { RouterModule as NestJsRouterModule } from '@nestjs/core';
import { RoutesUserModule } from 'src/router/routes/routes.user.module';
import { RoutesPublicModule } from 'src/router/routes/routes.public.module';
import { RoutesAdminModule } from 'src/router/routes/routes.admin.module';
import { RoutesSharedModule } from 'src/router/routes/routes.shared.module';

@Module({
    providers: [],
    exports: [],
    controllers: [],
    imports: [
        RoutesPublicModule,
        RoutesUserModule,
        RoutesAdminModule,
        RoutesSharedModule,
        NestJsRouterModule.register([
            {
                path: '/public',
                module: RoutesPublicModule,
            },
            {
                path: '/admin',
                module: RoutesAdminModule,
            },
            {
                path: '/user',
                module: RoutesUserModule,
            },
            {
                path: '/shared',
                module: RoutesSharedModule,
            },
        ]),
    ],
})
export class RouterModule {}
