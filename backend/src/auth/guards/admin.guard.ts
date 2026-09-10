import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Role } from "src/user/enums/role.enum";

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    return request.user.role === Role.SUPER_ADMIN;
  }
}