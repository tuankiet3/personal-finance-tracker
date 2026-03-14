import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data: any) => ({
        success: true,
        data: data?.data !== undefined ? data.data : data,
        message: data?.message || 'Success',
        ...(data?.meta ? { meta: data.meta } : {}),
      })),
    );
  }
}
