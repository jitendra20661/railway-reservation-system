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

@Injectable()
export class TrainService {

  constructor(
    @InjectModel(Train.name) 
    private readonly trainModel: Model<TrainDocument>,
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
    const train = await this.trainModel
      .findById(id)
      .exec();

    if (!train) {
      throw new NotFoundException('Train not found');
    }

    train.isActive = false;
    return train.save();
  }
}