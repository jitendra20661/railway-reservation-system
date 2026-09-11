import { SetMetadata } from '@nestjs/common';
import {PermissionAction,PermissionResource,} from '../enums/permission.enum';

export const PERMISSION_KEY = 'permission';

export const RequirePermission = (
  resource: PermissionResource,
  action: PermissionAction,
) =>
  SetMetadata(PERMISSION_KEY, {
    resource,
    action,
  });