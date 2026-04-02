import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * 统一响应格式
 */
export interface Response<T> {
  code: number;
  message: string;
  data: T;
}

/**
 * 响应转换拦截器
 * 将所有响应统一为 { code: 0, message: 'ok', data: ... } 格式
 */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  Response<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => ({
        code: 0,
        message: 'ok',
        data: data ?? null,
      })),
    );
  }
}
