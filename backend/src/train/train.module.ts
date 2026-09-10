import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { TrainController } from './train.controller';
import { TrainService } from './train.service';
import { Train, TrainSchema } from './schemas/train.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Train.name,
        schema: TrainSchema,
      },
    ]),
  ],
  controllers: [TrainController],
  providers: [TrainService],
  exports: [TrainService],
})
export class TrainModule {}