import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import { Reflector } from '@nestjs/core';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

// import { User } from '../../users/schemas/user.schema';

import {
  PermissionAction,
  PermissionResource,
} from '../enums/permission.enum';

import { PERMISSION_KEY } from '../decorator/permission.decorator';
import { User } from 'src/user/schemas/user.schema';
import { Role } from 'src/user/enums/role.enum';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,

    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const permission =
      this.reflector.getAllAndOverride<{
        resource: PermissionResource;
        action: PermissionAction;
      }>(PERMISSION_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);

    if (!permission) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    const jwtUser = request.user;

    if (!jwtUser?.sub) {
      throw new ForbiddenException(
        'User not authenticated',
      );
    }

    const user = await this.userModel
      .findById(jwtUser.sub)
      .select('role permissions') //performing a projection. It tells MongoDB to only return the role and permissions fields
      .lean()
      .exec();

    if (!user) {
      throw new ForbiddenException(
        'User not found',
      );
    }

    // SUPER_ADMIN can do everything
    if (user.role === Role.SUPER_ADMIN) {
      return true;
    }

    const resourcePermission = user.permissions?.find(
      (item) =>
        item.resource === permission.resource,
    );

    if (!resourcePermission) {
      throw new ForbiddenException(
        'You do not have permission to perform this action',
      );
    }

    const hasPermission =
      resourcePermission.actions.includes(
        permission.action,
      );

    if (!hasPermission) {
      throw new ForbiddenException(
        'You do not have permission to perform this action',
      );
    }

    return true;
  }
}