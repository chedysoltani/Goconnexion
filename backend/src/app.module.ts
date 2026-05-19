import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { FreelancersModule } from './freelancers/freelancers.module';
import { EntrepreneursModule } from './entrepreneurs/entrepreneurs.module';
import { ProjectsModule } from './projects/projects.module';
import { MessagingModule } from './messaging/messaging.module';
import { NotificationsModule } from './notifications/notifications.module';
import { IncubatorModule } from './incubator/incubator.module';
import { AdminModule } from './admin/admin.module';
import { UploadsModule } from './uploads/uploads.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { FeedModule } from './feed/feed.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConnectionsModule } from './connections/connections.module';

import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    AuthModule,
    UsersModule,
    FreelancersModule,
    EntrepreneursModule,
    ProjectsModule,
    MessagingModule,
    NotificationsModule,
    IncubatorModule,
    AdminModule,
    UploadsModule,
    AnalyticsModule,
    PrismaModule,
    FeedModule,
    ConnectionsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
