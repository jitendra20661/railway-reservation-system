import { Controller, Get, Post, Body, Param, Req, UseGuards, Patch } from '@nestjs/common';
import { UserService } from './user.service';
import { PermissionGuard } from 'src/permission/guards/permission.guard';
import { PermissionAction, PermissionResource } from 'src/permission/enums/permission.enum';
import { RequirePermission } from 'src/permission/decorator/permission.decorator';
import { SuperAdminGuard } from 'src/auth/guards/super-admin.guard';
import { Permission } from './schemas/user.schema';



@Controller('user')
// @UseGuards(PermissionGuard)
export class UserController {
  constructor(
    private readonly userService: UserService,
  ) {}



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

  @Patch(':id/permissions')
  @UseGuards(PermissionGuard)
  @RequirePermission(PermissionResource.USERS,PermissionAction.UPDATE)
  updatePermissions(
    @Param('id') id: string,
    @Body() permissions: Permission[],
  ) {
    return this.userService.updatePermissions(id, permissions);
  }


  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.userService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  //   return this.userService.update(+id, updateUserDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.userService.remove(+id);
  // }
}
