import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from './auth.service';
import { IS_PUBLIC_KEY } from '../common/decorators/public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 检查是否是公开接口
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authorization = request.headers['authorization'];

    if (!authorization) {
      throw new UnauthorizedException('未提供认证信息');
    }

    const token = authorization.replace('Bearer ', '');
    const userId = await this.authService.validateToken(token);

    if (!userId) {
      throw new UnauthorizedException('无效的认证信息');
    }

    // 将用户信息挂载到 request 上
    request.user = { userId };
    return true;
  }
}
