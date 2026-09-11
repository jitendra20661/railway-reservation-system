import {
  IsArray,
  IsEnum,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PermissionAction, PermissionResource } from '../enums/permission.enum';

// import {
//   PermissionAction,
//   PermissionResource,
// } from '../../auth/permissions/permission.enum';


class PermissionItemDto {
  @IsString()
  @IsEnum(PermissionResource)
  resource: PermissionResource;

  @IsArray()
  @IsEnum(PermissionAction, { each: true })
  actions: PermissionAction[];
}

export class UpdatePermissionsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PermissionItemDto)
  permissions: PermissionItemDto[];
}