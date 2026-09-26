import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { LoginUserDto } from './dto/login.dto';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { Role } from 'src/user/enums/role.enum';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  create(@Body() dto: CreateUserDto) {
    return this.authService.register(
      dto.name,
      dto.email,
      dto.password,
      Role.USER,
      dto.isActive,
    );
  }

    @Public()
    @Post('login')
    signIn(@Body() loginUserDto: LoginUserDto) {
        return this.authService.login(loginUserDto);
    }
}
