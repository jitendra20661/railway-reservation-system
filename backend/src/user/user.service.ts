import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
// import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { UpdatePermissionsDto } from 'src/permission/dto/update-permissions.dto';
import { Role } from './enums/role.enum';
import { Booking, BookingStatus } from 'src/booking/schemas/booking.schema';
import * as bcrypt from 'bcrypt';


@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Booking.name) private bookingModel: Model<Booking>
  ){}


  async createUser(
  name: string,
  email: string,
  password: string,
  role: Role,
  isActive: boolean = true,
  // createdBy =Role.SUPER_ADMIN,
) {
  const existingUser = await this.userModel.findOne({
    email: email.toLowerCase(),
  });

  if (existingUser) {
    throw new UnauthorizedException("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new this.userModel({
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    role,
    isActive,
  });

  return user.save();
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
  
async updateRole(userId: string, role: Role) {
  const user = await this.userModel.findById(userId);

  if (!user) {
    throw new NotFoundException('User not found');
  }

  if (user.role === Role.SUPER_ADMIN) {
    throw new BadRequestException(
      'SUPER_ADMIN role cannot be changed.',
    );
  }

  if (role === Role.SUPER_ADMIN) {
    throw new BadRequestException(
      'SUPER_ADMIN role cannot be assigned.',
    );
  }

  user.role = role;

  // Optional but recommended:
  // When changing back to USER, remove admin permissions.
  if (role === Role.USER) {
    user.permissions = [];
  }

  return user.save();
}

async deactivate(_id: string) {
  const user = await this.userModel.findById(_id);

  if (!user) {
    throw new NotFoundException('User not found');
  }

  // SUPER_ADMIN user cannot be deactivated
    if (user.role === Role.SUPER_ADMIN) {
      throw new BadRequestException(
        'SUPER_ADMIN cannot be deleted.',
      );
    }

  const today = new Date().toISOString().split('T')[0];

  const bookingCount = await this.bookingModel.countDocuments({
    userId: _id,
    journeyDate: { $gte: today },
    status: {
      $in: [BookingStatus.PENDING, BookingStatus.CONFIRMED],
    },
  });

  if (bookingCount > 0) {
    throw new BadRequestException(
      'User has future bookings, cannot deactivate.',
    );
  }

  user.isActive = false;

  return await user.save();
}



}
