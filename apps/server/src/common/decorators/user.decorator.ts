import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../../auth/auth.service';

/**
 * 从请求中提取用户 ID 的装饰器
 * 使用方式: @UserId() userId: number
 */
export const UserId = createParamDecorator(
  async (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const authorization = request.headers['authorization'];

    if (!authorization) {
      throw new UnauthorizedException('未提供认证信息');
    }

    const token = authorization.replace('Bearer ', '');

    // 从 request 中获取 AuthService（通过 app 的依赖注入）
    const authService = request.app.get(AuthService);
    const userId = await authService.validateToken(token);

    if (!userId) {
      throw new UnauthorizedException('无效的认证信息');
    }

    return userId;
  },
);
