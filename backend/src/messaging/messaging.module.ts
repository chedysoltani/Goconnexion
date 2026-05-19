import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MessagingService } from './messaging.service';
import { MessagingController } from './messaging.controller';
import { MessagingGateway } from './messaging.gateway';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'goconnexions-super-secret-key-12345!',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [MessagingController],
  providers: [MessagingService, MessagingGateway],
  exports: [MessagingService],
})
export class MessagingModule {}
