import {
  Injectable, CanActivate, ExecutionContext, ForbiddenException, SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PlanFeatureFlag, planLimitsFor } from './plans';

export const PLAN_FEATURE_KEY = 'planFeature';

// À combiner avec JwtAuthGuard : @UseGuards(JwtAuthGuard, PlanFeatureGuard)
export const RequiresFeature = (feature: PlanFeatureFlag) =>
  SetMetadata(PLAN_FEATURE_KEY, feature);

@Injectable()
export class PlanFeatureGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const feature = this.reflector.getAllAndOverride<PlanFeatureFlag>(PLAN_FEATURE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!feature) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!planLimitsFor(user?.subscription)[feature]) {
      throw new ForbiddenException(
        'Cette fonctionnalité n\'est pas incluse dans votre plan. Passez à un plan supérieur pour y accéder.',
      );
    }
    return true;
  }
}
