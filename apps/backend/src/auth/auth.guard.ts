import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import type { IncomingHttpHeaders } from 'node:http';
import { AuthService } from './auth.service';

export type AuthRequest = {
  headers: IncomingHttpHeaders;
  session?: Awaited<ReturnType<AuthService['getSession']>>;
};

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthRequest>();
    request.session = await this.auth.getSession(request.headers);
    return true;
  }
}
