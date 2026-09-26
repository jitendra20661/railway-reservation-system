import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { Booking, BookingSchema } from 'src/booking/schemas/booking.schema';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      {name: Booking.name, schema: BookingSchema},
    ]),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService,MongooseModule,]
})
export class UserModule {}
