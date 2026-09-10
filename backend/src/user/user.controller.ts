import { Controller, Get, Post, Body, Param, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JWTAuthGuard } from 'src/auth/guards/jwtauth.guard';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
  ) {}

  // @Post()
  // create(@Body() createUserDto: CreateUserDto) {
  //   return this.userService.create(createUserDto);
  // }


  @Public() //TODO: remove public later
  @Get()
  getUsers() {
    return this.userService.findAll();
  }

  // @UseGuards(JWTAuthGuard)
  @Get('me')
  getMe(@Req() req) {
    // const token = req.headers.authorization?.replace('Bearer ', '');
    // const payload = await this.jwtAuthService.verifyToken(token);
    return this.userService.findById(req.user.sub);
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
