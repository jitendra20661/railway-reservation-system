import { Controller, Get, Body, Param, Req, UseGuards, Patch, Delete, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { PermissionGuard } from 'src/permission/guards/permission.guard';
import { PermissionAction, PermissionResource } from 'src/permission/enums/permission.enum';
import { RequirePermission } from 'src/permission/decorator/permission.decorator';
import { UpdatePermissionsDto } from 'src/permission/dto/update-permissions.dto';
import { UpdateUserRoleDto } from './dto/role-update.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { Role } from './enums/role.enum';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  getMe(@Req() req) {
    return this.userService.findById(req.user.sub);
  }

  @UseGuards(PermissionGuard)
  @RequirePermission(PermissionResource.USERS, PermissionAction.READ)
  @Get()
  getAllUsers() {
    return this.userService.findAll();
  }

  @Post()
  @UseGuards(PermissionGuard)
  @RequirePermission(PermissionResource.USERS, PermissionAction.CREATE)
  createSubAdmin(@Body() dto: CreateUserDto, @Req() req: any) {
    return this.userService.createUser(
      dto.name,
      dto.email,
      dto.password,
      Role.SUB_ADMIN,
      dto.isActive
    );
  }

  @Patch(':id/permissions')
  @UseGuards(PermissionGuard)
  @RequirePermission(PermissionResource.USERS, PermissionAction.UPDATE)
  updatePermissions(
    @Param('id') id: string,
    @Body() dto: UpdatePermissionsDto,
  ) {
    return this.userService.updatePermissions(id, dto.permissions);
  }

  @Patch(':id/role')
  @UseGuards(PermissionGuard)
  @RequirePermission(PermissionResource.USERS, PermissionAction.UPDATE)
  updateRole(
    @Param('id') id: string,
    @Body() dto: UpdateUserRoleDto,
  ) {
    return this.userService.updateRole(id, dto.role);
  }

  @UseGuards(PermissionGuard)
  @RequirePermission(PermissionResource.USERS, PermissionAction.DELETE)
  @Delete(':id')
  deactivate(@Param('id') id: string) {
    return this.userService.deactivate(id);
  }
}