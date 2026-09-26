import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  Schedule,
  ScheduleDirection,
  ScheduleDocument,
  ScheduleStatus,
} from './schemas/schedule.schema';

import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

import { StationService } from '../station/station.service';
import { TrainService } from '../train/train.service';
import { SearchScheduleDto } from './dto/search-schedule.dto';
import { Booking, BookingDocument, BookingStatus } from 'src/booking/schemas/booking.schema';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectModel(Schedule.name)
    private readonly scheduleModel: Model<ScheduleDocument>,
    @InjectModel(Booking.name)
    private readonly bookingModel: Model<BookingDocument>,

    private readonly stationService: StationService,
    private readonly trainService: TrainService,
  ) {}

  private getDayIndex(date: string): number {
    const parsedDate = new Date(`${date}T00:00:00`);

    if (isNaN(parsedDate.getTime())) {
      throw new BadRequestException('Invalid date');
    }

    const jsDay = parsedDate.getDay();

    return jsDay === 0 ? 6 : jsDay - 1;
  }

  async create(createScheduleDto: CreateScheduleDto) {
    const { trainId, direction, stops, operatingDays, status } =
      createScheduleDto;

    // 1. Check train
    const train = await this.trainService.findById(trainId);

    if (!train) {
      throw new NotFoundException('Train not found');
    }

    if (!train.isActive) {
      throw new BadRequestException('Train is inactive');
    }

    // 2. Minimum number of stops
    if (stops.length < 2) {
      throw new BadRequestException('Schedule must have at least two stops');
    }

    // // 3. Check duplicate stations
    // const stationIds = stops.map((stop) => stop.stationId);

    // const uniqueStationIds = new Set(stationIds);

    // if (uniqueStationIds.size !== stationIds.length) {
    //   throw new BadRequestException(
    //     'A station cannot appear more than once in a schedule',
    //   );
    // }

    // // 4. Fetch and validate all stations
    // const stations = [];

    // for (const stationId of stationIds) {
    //   const station = await this.stationService.findById(stationId);

    //   if (!station) {
    //     throw new NotFoundException(
    //       `Station ${stationId} not found`,
    //     );
    //   }

    //   if (!station.isActive) {
    //     throw new BadRequestException(
    //       `Station ${station.name} is inactive`,
    //     );
    //   }

    //   stations.push(station);
    // }

    // // 5. Validate first and last station
    // const firstStation = stations[0];
    // const lastStation = stations[stations.length - 1];

    // // 6. Validate station order
    // for (let i = 0; i < stations.length - 1; i++) {
    //   const currentDistance =
    //     stations[i].distanceFromRoha;

    //   const nextDistance =
    //     stations[i + 1].distanceFromRoha;

    //   if (
    //     direction === ScheduleDirection.ROHA_TO_THOKUR &&
    //     currentDistance >= nextDistance
    //   ) {
    //     throw new BadRequestException(
    //       'Stations must be ordered from Roha to Thokur',
    //     );
    //   }

    //   if (
    //     direction === ScheduleDirection.THOKUR_TO_ROHA &&
    //     currentDistance <= nextDistance
    //   ) {
    //     throw new BadRequestException(
    //       'Stations must be ordered from Thokur to Roha',
    //     );
    //   }
    // }

    // // 7. Validate arrival/departure times
    // for (let i = 0; i < stops.length; i++) {
    //   const stop = stops[i];

    //   // First station should only have departure
    //   if (i === 0) {
    //     if (stop.arrivalTime) {
    //       throw new BadRequestException(
    //         'First station cannot have an arrival time',
    //       );
    //     }

    //     if (!stop.departureTime) {
    //       throw new BadRequestException(
    //         'First station must have a departure time',
    //       );
    //     }
    //   }

    //   // Last station should only have arrival
    //   if (i === stops.length - 1) {
    //     if (stop.departureTime) {
    //       throw new BadRequestException(
    //         'Last station cannot have a departure time',
    //       );
    //     }

    //     if (!stop.arrivalTime) {
    //       throw new BadRequestException(
    //         'Last station must have an arrival time',
    //       );
    //     }
    //   }

    //   // Intermediate stations need both
    //   if (i > 0 && i < stops.length - 1) {
    //     if (!stop.arrivalTime || !stop.departureTime) {
    //       throw new BadRequestException(
    //         'Intermediate stations must have both arrival and departure times',
    //       );
    //     }
    //   }

    //   // Arrival cannot be after departure
    //   if (
    //     stop.arrivalTime &&
    //     stop.departureTime &&
    //     stop.arrivalTime > stop.departureTime
    //   ) {
    //     throw new BadRequestException(
    //       `Arrival time cannot be after departure time at station ${stations[i].name}`,
    //     );
    //   }
    // }

    // 8. Create schedule
    const schedule = new this.scheduleModel({
      trainId,
      direction,
      stops,
      operatingDays,
      status: status ?? ScheduleStatus.ACTIVE,
    });

    return schedule.save();
  }

  async findAll() {
    return this.scheduleModel
      .find()
      .populate('trainId')
      .populate('stops.stationId')
      .exec();
  }

  async findById(id: string) {
    const schedule = await this.scheduleModel
      .findById(id)
      .populate('trainId')
      .populate('stops.stationId')
      .exec();

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    return schedule;
  }

  // async update(
  //   id: string,
  //   updateScheduleDto: UpdateScheduleDto,
  // ) {
  //   const schedule = await this.scheduleModel
  //     .findByIdAndUpdate(
  //       id,
  //       updateScheduleDto,
  //       {
  //         new: true,
  //         runValidators: true,
  //       },
  //     )
  //     .exec();

  //   if (!schedule) {
  //     throw new NotFoundException('Schedule not found');
  //   }

  //   return schedule;
  // }

async search(searchScheduleDto: SearchScheduleDto) {
  const { from, to, date } = searchScheduleDto;

  const fromStation = await this.stationService.findByCode(
    from.toUpperCase(),
  );

  if (!fromStation) {
    throw new NotFoundException(`Source station ${from} not found`);
  }

  const toStation = await this.stationService.findByCode(to.toUpperCase());

  if (!toStation) {
    throw new NotFoundException(`Destination station ${to} not found`);
  }

  if (fromStation.id === toStation.id) {
    throw new BadRequestException(
      'Source and destination stations cannot be the same',
    );
  }

  let direction: ScheduleDirection;

  if (fromStation.distanceFromRoha < toStation.distanceFromRoha) {
    direction = ScheduleDirection.ROHA_TO_THOKUR;
  } else {
    direction = ScheduleDirection.THOKUR_TO_ROHA;
  }

  const dayIndex = this.getDayIndex(date);

  const schedules = await this.scheduleModel
    .find({
      direction,
      status: ScheduleStatus.ACTIVE,
    })
    .populate('trainId')
    .populate('stops.stationId')
    .exec();

  const results: any[] = [];

  const today = new Date();
  const journeyDate = new Date(`${date}T00:00:00`);

  const isToday =
    today.getFullYear() === journeyDate.getFullYear() &&
    today.getMonth() === journeyDate.getMonth() &&
    today.getDate() === journeyDate.getDate();

  for (const schedule of schedules) {
    if (schedule.operatingDays[dayIndex] !== '1') {
      continue;
    }

    const fromIndex = schedule.stops.findIndex(
      (stop) => stop.stationId._id.toString() === fromStation._id.toString(),
    );

    const toIndex = schedule.stops.findIndex(
      (stop) => stop.stationId._id.toString() === toStation._id.toString(),
    );

    if (fromIndex === -1 || toIndex === -1) {
      continue;
    }

    if (fromIndex >= toIndex) {
      continue;
    }

    if (isToday) {
      const departureTime = schedule.stops[fromIndex].departureTime;

      if (departureTime) {
        const [hours, minutes] = departureTime.split(':').map(Number);

        const departureDate = new Date();
        departureDate.setHours(hours, minutes, 0, 0);

        if (departureDate <= today) {
          continue;
        }
      }
    }

    results.push({
      scheduleId: schedule._id,
      train: schedule.trainId,

      from: {
        stationId: fromStation._id,
        stationCode: fromStation.stationCode,
        stationName: fromStation.name,
        departureTime: schedule.stops[fromIndex].departureTime,
      },

      to: {
        stationId: toStation._id,
        stationCode: toStation.stationCode,
        stationName: toStation.name,
        arrivalTime: schedule.stops[toIndex].arrivalTime,
      },

      direction: schedule.direction,
    });
  }

  return results;
}

async remove(id: string) {
  const schedule = await this.scheduleModel.findById(id).exec();

  if (!schedule) {
    throw new NotFoundException('Schedule not found');
  }

  const today = new Date().toISOString().split('T')[0];

  const bookings = await this.bookingModel
    .find({
      scheduleId: id,
      journeyDate: { $gte: today },
      status: {
        $in: [BookingStatus.PENDING, BookingStatus.CONFIRMED],
      },
    })
    .exec();

  if (bookings.length > 0) {
    await this.bookingModel.updateMany(
      {
        scheduleId: id,
        journeyDate: { $gte: today },
        status: {
          $in: [BookingStatus.PENDING, BookingStatus.CONFIRMED],
        },
      },
      {
        $set: {
          status: BookingStatus.CANCELLED,
        },
      },
    );
  }

  schedule.status = ScheduleStatus.INACTIVE;

  return await schedule.save();
}
}
