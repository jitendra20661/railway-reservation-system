import { ScheduleModule } from 'src/schedule/schedule.module';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  Train,
  TrainDocument,
} from './schemas/train.schema';

import { CreateTrainDto } from './dto/create-train.dto';
import { Schedule, ScheduleDocument, ScheduleStatus } from 'src/schedule/schemas/schedule.schema';
import { Booking, BookingDocument, BookingStatus } from 'src/booking/schemas/booking.schema';

@Injectable()
export class TrainService {

  constructor(
    @InjectModel(Train.name) 
    private readonly trainModel: Model<TrainDocument>,

    @InjectModel(Schedule.name) 
    private readonly scheduleModel: Model<ScheduleDocument>,
    
    @InjectModel(Booking.name) 
    private readonly bookingModel: Model<BookingDocument>,

  ) {}

  async create(createTrainDto: CreateTrainDto) {
    const existingTrain = await this.trainModel.findOne({
      trainNumber: createTrainDto.trainNumber,
    });

    if (existingTrain) {
      throw new ConflictException(
        'Train with this number already exists',
      );
    }

    const train = new this.trainModel(createTrainDto);

    return train.save();
  }

  async findAll() {
    return this.trainModel
      .find()
      .sort({ trainNumber: 1 })
      .exec();
  }

  async findById(id: string) {
    const train = await this.trainModel
      .findById(id)
      .exec();

    if (!train) {
      throw new NotFoundException('Train not found');
    }

    return train;
  }

  // async update(
  //   id: string,
  //   updateTrainDto: UpdateTrainDto,
  // ) {
  //   const train = await this.trainModel
  //     .findByIdAndUpdate(
  //       id,
  //       updateTrainDto,
  //       {
  //         new: true,
  //         runValidators: true,
  //       },
  //     )
  //     .exec();

  //   if (!train) {
  //     throw new NotFoundException('Train not found');
  //   }

  //   return train;
  // }

  async remove(id: string) {
    // console.log(id)
  const train = await this.trainModel.findById(id).exec();

  console.log(train)
  
  if (!train) {
    throw new NotFoundException('Train not found');
  }

  console.log(train._id)

  const schedules = await this.scheduleModel
    .find({ trainId: id })
    .select('_id')
    .exec();
  console.log("schs: ", schedules);

  
  const scheduleIds = schedules.map((schedule) => schedule._id);
  console.log("schs ID: ", scheduleIds);


  const today = new Date().toISOString().split('T')[0];

  const res = await this.bookingModel.find(
    {
      scheduleId: scheduleIds 
    })
    console.log("res: ", res);


  // await this.bookingModel.updateMany(
  //   {
  //     scheduleId: { $in: scheduleIds },
  //     journeyDate: { $gt: today },
  //     status: {
  //       $in: [BookingStatus.PENDING, BookingStatus.CONFIRMED],
  //     },
  //   },
  //   {
  //     $set: {
  //       status: BookingStatus.CANCELLED,
  //     },
  //   },
  // );


  // await this.scheduleModel.updateMany(
  //   {
  //     trainId: train._id,
  //   },
  //   {
  //     $set: {
  //       status: "INACTIVE",
  //     },
  //   },
  // );

  // train.isActive = false;

  // return train.save();
}
}