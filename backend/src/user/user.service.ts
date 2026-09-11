import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
// import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { UpdatePermissionsDto } from 'src/permission/dto/update-permissions.dto';
import { Role } from './enums/role.enum';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>
  ){}

  async create(createUserDto: CreateUserDto) {
    // console.log(createUserDto);
    await this.userModel.create(createUserDto);
    return 'User created successful';
  }
  
  async findOne(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec(); // -password field is required in authService.login method for bcrypt.compare()
    // .findOne({ email }).select('-password').exec();


  }

  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).select('-password').exec();
  }
  


  async findAll() {
    return await this.userModel.find().select('-password').exec();
  }


  async updatePermissions(userId: string, permissions: UpdatePermissionsDto['permissions']) {
  const user = await this.userModel.findById(userId);

  if (!user) {
    throw new NotFoundException('User not found');
  }

  // TODO: Later allow normal user to be promoted to SUB_ADMIN
  if (user.role !== Role.SUB_ADMIN) {
    throw new BadRequestException(
      'Permissions can only be assigned to SUB_ADMIN users',
    );
  }

  user.permissions = permissions;

  return user.save();
}
  
  // update(id: number, updateUserDto: UpdateUserDto) {
  //   return `This action updates a #${id} user`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} user`;
  // }
}
