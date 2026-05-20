import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class LastActiveInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    if (request && request.user && request.user.id) {
      // Update lastActiveAt in the background without blocking the user request
      this.prisma.user
        .update({
          where: { id: request.user.id },
          data: { lastActiveAt: new Date() },
        })
        .catch((err) => {
          console.error('Failed to update lastActiveAt for user:', request.user.id, err);
        });
    }

    return next.handle();
  }
}
