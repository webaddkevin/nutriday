import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * 从请求中提取用户 ID 的装饰器
 * 需要配合 AuthGuard 使用
 * 使用方式: @UserId() userId: number
 */
export const UserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): number => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.userId;
  },
);
