import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Booking, BookingSchema } from './schemas/booking.schema';
import { ScheduleModule } from 'src/schedule/schedule.module';
import { StationModule } from 'src/station/station.module';
import { TrainModule } from 'src/train/train.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Booking.name,
        schema: BookingSchema,
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