import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './schedule.service';
import {
  Schedule,
  ScheduleSchema,
} from './schemas/schedule.schema';
import { StationModule } from 'src/station/station.module';
import { TrainModule } from 'src/train/train.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Schedule.name,
        schema: ScheduleSchema,
      },
    ]),
    StationModule,
    TrainModule,
  ],
  controllers: [ScheduleController],
  providers: [ScheduleService],
  exports: [ScheduleService],
})
export class ScheduleModule {}