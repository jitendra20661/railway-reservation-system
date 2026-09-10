import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  Station,
  StationDocument,
} from './schemas/station.schema';

import { CreateStationDto } from './dto/create-station.dto';

@Injectable()
export class StationService {
  constructor(
    @InjectModel(Station.name)
    private readonly stationModel: Model<StationDocument>,
  ) {}

  async create(createStationDto: CreateStationDto) {
    const existingStation = await this.stationModel.findOne({
      stationCode: createStationDto.stationCode.toUpperCase(),
    });

    if (existingStation) {
      throw new ConflictException(
        'Station with this code already exists',
      );
    }

    const station = new this.stationModel({
      ...createStationDto,
      stationCode: createStationDto.stationCode.toUpperCase(),
    });

    return station.save();
  }

  async findAll() {
    return this.stationModel
      .find()
      .sort({ name: 1 })
      .exec();
  }

  async findById(id: string) {
    const station = await this.stationModel.findById(id).exec();
    if (!station) {
      throw new NotFoundException('Station not found');
    }
    return station;
  }

  async findByCode(stationCode: string) {
  return this.stationModel
    .findOne({
      stationCode: stationCode.toUpperCase(),
      isActive: true,
    })
    .exec();
}

  // async update(
  //   id: string,
  //   updateStationDto: UpdateStationDto,
  // ) {
  //   const station = await this.stationModel
  //     .findByIdAndUpdate(
  //       id,
  //       updateStationDto,
  //       {
  //         new: true,
  //         runValidators: true,
  //       },
  //     )
  //     .exec();

  //   if (!station) {
  //     throw new NotFoundException('Station not found');
  //   }

  //   return station;
  // }


  // async remove(id: string) {
  //   const station = await this.stationModel.findById(id).exec();

  //   if (!station) {
  //     throw new NotFoundException('Station not found');
  //   }

  //   station.isActive = false;

  //   return station.save();
  // }

  // async search(query: string) {
  //   return this.stationModel
  //     .find({
  //       isActive: true,
  //       $or: [
  //         { code: { $regex: query, $options: 'i' } },
  //         { name: { $regex: query, $options: 'i' } },
  //         { city: { $regex: query, $options: 'i' } },
  //       ],
  //     })
  //     .limit(10)
  //     .exec();
  // }
}