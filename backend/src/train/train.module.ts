import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { TrainController } from './train.controller';
import { TrainService } from './train.service';
import { Train, TrainSchema } from './schemas/train.schema';
import { UserModule } from 'src/user/user.module';
import { User, UserSchema } from 'src/user/schemas/user.schema';
import { Schedule, ScheduleSchema } from 'src/schedule/schemas/schedule.schema';
import { Booking, BookingSchema } from 'src/booking/schemas/booking.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Train.name,
        schema: TrainSchema,
      },
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: Booking.name,
        schema: BookingSchema,
      },
      {
        name: Schedule.name,
        schema: ScheduleSchema,
      },

    ]),
    
  ],
  controllers: [TrainController],
  providers: [TrainService],
  exports: [TrainService],
})
export class TrainModule {}