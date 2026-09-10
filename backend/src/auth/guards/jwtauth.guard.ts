import { JwtService } from '@nestjs/jwt';

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

import { Reflector } from '@nestjs/core';

@Injectable()
export class JWTAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check whether this route is public 
    // i.e Check if the handler has the @Public decorator metadata
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_KEY,
      [
        context.getHandler(),
        context.getClass(),
      ],
    );

    console.log('IS PUBLIC:', isPublic);

    // If @Public() is present, skip authentication
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      // 💡 Here the JWT secret key that's used for verifying the payload 
      // is the key that was passed in the JwtModule
      const payload = await this.jwtService.verifyAsync(token);
      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}


// NOTE: remember there is something called passport jwt strategy implementation for checking jwt.