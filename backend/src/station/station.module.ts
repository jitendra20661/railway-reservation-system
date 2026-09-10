import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StationService } from './station.service';
import { StationController } from './station.controller';
import { Station, StationSchema } from './schemas/station.schema';

@Module({
  imports: [MongooseModule.forFeature([
    {
        name: Station.name,
        schema: StationSchema,      
    }
  ])],
  controllers: [StationController,],
  providers: [StationService],
  exports: [StationService]
})
export class StationModule {}
