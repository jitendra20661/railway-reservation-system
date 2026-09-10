import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { StationService } from './station/station.service';
import { StationController } from './station/station.controller';
import { StationModule } from './station/station.module';
import { TrainModule } from './train/train.module';
import { ScheduleModule } from './schedule/schedule.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { BookingModule } from './booking/booking.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    MongooseModule.forRoot(process.env.MONGO_URI!),


    AuthModule, UserModule, StationModule, TrainModule, ScheduleModule, BookingModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
