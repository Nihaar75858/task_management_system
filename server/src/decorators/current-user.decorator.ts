import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type {
  RequestUser,
  RequestUserWithRefreshToken,
} from '../types/jwt-payload.type';

export const CurrentUser = createParamDecorator(
  (
    _data: unknown,
    ctx: ExecutionContext,
  ): RequestUser | RequestUserWithRefreshToken => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.user as RequestUser | RequestUserWithRefreshToken;
  },
);
