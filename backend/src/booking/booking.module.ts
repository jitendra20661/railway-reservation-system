import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Booking, BookingSchema } from './schemas/booking.schema';
import { ScheduleModule } from 'src/schedule/schedule.module';
import { StationModule } from 'src/station/station.module';
import { TrainModule } from 'src/train/train.module';
import { Schedule, ScheduleSchema } from 'src/schedule/schemas/schedule.schema';
import { User, UserSchema } from 'src/user/schemas/user.schema';
import { Station, StationSchema } from 'src/station/schemas/station.schema';
import { Train, TrainSchema } from 'src/train/schemas/train.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Booking.name,
        schema: BookingSchema,
      },
      {
        name: Schedule.name,
        schema: ScheduleSchema,
      },
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: Station.name,
        schema: StationSchema,
      },
      {
        name: Train.name,
        schema: TrainSchema,
      },
    ]),
    ScheduleModule,
    StationModule,
    TrainModule,
  ],
  controllers: [BookingController],
  providers: [BookingService],
})
export class BookingModule {}