import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { TrainController } from './train.controller';
import { TrainService } from './train.service';
import { Train, TrainSchema } from './schemas/train.schema';
import { UserModule } from 'src/user/user.module';
import { User, UserSchema } from 'src/user/schemas/user.schema';

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

    ]),
    
  ],
  controllers: [TrainController],
  providers: [TrainService],
  exports: [TrainService],
})
export class TrainModule {}