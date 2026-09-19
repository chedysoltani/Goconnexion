import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class AmbassadorGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest();
    if (!user?.isAmbassador) {
      throw new ForbiddenException('Réservé aux ambassadeurs');
    }
    return true;
  }
}
