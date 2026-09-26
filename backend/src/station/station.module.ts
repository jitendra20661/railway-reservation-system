import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StationService } from './station.service';
import { StationController } from './station.controller';
import { Station, StationSchema } from './schemas/station.schema';
import { Booking, BookingSchema } from 'src/booking/schemas/booking.schema';

@Module({
  imports: [MongooseModule.forFeature([
    {
        name: Station.name,
        schema: StationSchema,      
    },
    //  {
    //     name: Booking.name,
    //     schema: BookingSchema,
    //   },
  ])],
  controllers: [StationController,],
  providers: [StationService],
  exports: [StationService]
})
export class StationModule {}
