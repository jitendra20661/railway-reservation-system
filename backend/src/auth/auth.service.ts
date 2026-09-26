import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { LoginUserDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { permission } from 'process';
import { RegisterDto } from './dto/register.dto';
import { Role } from 'src/user/enums/role.enum';


@Injectable()
export class AuthService {
    constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  // Register a new user
  // async register(createUserDto: CreateUserDto) {
  //   // 1. Check whether user already exists
  //   const existingUser = await this.userService.findOne(createUserDto.email);
  //   if (existingUser) {
  //     throw new UnauthorizedException('User already exists');
  //   }
  //   // 2. Hash password
  //   const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

  //   // 3. Create user with hashed password
  //   const res = await this.userService.create({
  //     ...createUserDto,
  //     password: hashedPassword,
  //   });

  //   // 4. Return appropriate response
  //   return res;
  // }

  async register(
    name: string,
    email: string,
    password: string,
    role: Role,
    isActive: boolean,
  ) {
    return this.userService.createUser(
      name,
      email,
      password,
      role,
      isActive,
    );
  }






  async login(loginUserDto: LoginUserDto): Promise<{
  access_token: string;
  user: any;
}> {
  // 1. Find user
  const { email, password } = loginUserDto;
  const user = await this.userService.findOne(email);

  if (!user) {
    throw new UnauthorizedException('Invalid email or password');
  }

  // 2. Compare password
  // console.log("loginUserDto.pass and user.password=", loginUserDto.password, user.password)
  const match = await bcrypt.compare(
    password,
    user.password,
  );

  if (!match) {
    throw new UnauthorizedException('Invalid email or password');
  }

  // 3. Generate JWT
  const payload = {
    sub: user._id.toString(),
    email: user.email,
    role: user.role,

  };

  const accessToken = await this.jwtService.signAsync(payload);

  // 4. Remove password from response
  const userWithoutPassword = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    permissions: user.permissions
  };

  // 5. Return token + user details
  return {
    access_token: accessToken,
    user: userWithoutPassword,
  };
}

  // Later:
  validateUser() {}
  refreshToken() {}
  logout() {}

}
