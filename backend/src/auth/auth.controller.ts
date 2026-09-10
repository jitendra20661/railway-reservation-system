import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { LoginUserDto } from './dto/login.dto';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

    @Public()
    @Post('register')
    create(@Body() createUserDto: CreateUserDto) {
        return this.authService.register(createUserDto);
    }

    @Public()
    @HttpCode(HttpStatus.OK)
    @Post('login')
    signIn(@Body() loginUserDto: LoginUserDto) {
        return this.authService.login(loginUserDto);
    }
}
