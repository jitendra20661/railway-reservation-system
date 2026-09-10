import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  Booking,
  BookingDocument,
  BookingStatus,
} from './schemas/booking.schema';

import { ScheduleService } from '../schedule/schedule.service';
import { StationService } from '../station/station.service';
import { TrainService } from './../train/train.service';

import { TrainDocument } from '../train/schemas/train.schema';
import { CreateBookingDto } from './dto/create-booking.dto';




@Injectable()
export class BookingService {

  constructor(
    @InjectModel(Booking.name)
    private readonly bookingModel: Model<BookingDocument>,
    private readonly scheduleService: ScheduleService,
    private readonly stationService: StationService,
    private readonly trainService: TrainService,
  ) {}



  async getAllBooking(){
    return await this.bookingModel.find();
  }

  async getAvailability(scheduleId: string,fromStationId: string,toStationId: string,journeyDate: string) {
    
    // 1. Get schedule
    const schedule = await this.scheduleService.findById(scheduleId);
    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    // 2. Get stations
    const fromStation = await this.stationService.findById(fromStationId);
    const toStation = await this.stationService.findById(toStationId);
    if (!fromStation || !toStation) {
      throw new NotFoundException('Station not found');
    }

    // 3. Find positions inside schedule
    const fromIndex = schedule.stops.findIndex(
      (stop) => stop.stationId._id.toString() === fromStationId,
    );
    const toIndex = schedule.stops.findIndex(
      (stop) => stop.stationId._id.toString() === toStationId,
    );


    // 4. Both stations must exist in schedule
    if (fromIndex === -1 || toIndex === -1) {
      throw new BadRequestException(
        'Train does not stop at both requested stations',
      );
    }

    // 5. Source must come before destination
    if (fromIndex >= toIndex) {
      throw new BadRequestException('Destination must come after source');
    }


    // 6. Get train capacity
    const train = schedule.trainId as unknown as TrainDocument;
    const totalSeats = train.capacity;
    // const train = await this.trainService.findById(
    //   schedule.trainId.toString(),
    // );
    // const totalSeats = train.capacity;

    // 7. Get confirmed bookings for this journey date
    const bookings = await this.bookingModel.find({
      scheduleId,
      journeyDate,
      status: BookingStatus.CONFIRMED,
    });

    // 8. Track occupancy for every segment
    const segmentOccupancy = new Array(schedule.stops.length - 1).fill(0);

    // 9. Add each booking to its occupied segments
    for (const booking of bookings) {
      const bookingFromIndex = schedule.stops.findIndex(
        (stop) =>
          stop.stationId._id.toString() === booking.fromStationId.toString(),
      );

      const bookingToIndex = schedule.stops.findIndex(
        (stop) =>
          stop.stationId._id.toString() === booking.toStationId.toString(),
      );

      if (bookingFromIndex === -1 || bookingToIndex === -1) {
        continue;
      }

      for (let i = bookingFromIndex; i < bookingToIndex; i++) {
        segmentOccupancy[i] += booking.seats;
      }
    }

    // 10. Find maximum occupancy on requested journey
    let maxOccupancy = 0;

    for (let i = fromIndex; i < toIndex; i++) {
      maxOccupancy = Math.max(maxOccupancy, segmentOccupancy[i]);
    }

    // 11. Calculate availability
    const availableSeats = totalSeats - maxOccupancy;

    return {
      totalSeats,
      bookedSeats: maxOccupancy,
      availableSeats,
    };
  }



  async createBooking(
    userId: string,
    createBookingDto: CreateBookingDto,
  ) {
    const {
      scheduleId,
      journeyDate,
      fromStationId,
      toStationId,
      seats,
    } = createBookingDto;

    // 1. Check seat availability
    const availability =
      await this.getAvailability(
        scheduleId,
        fromStationId,
        toStationId,
        journeyDate,
      );

    // 2. Check if enough seats are available
    if (seats > availability.availableSeats) {
      throw new BadRequestException(
        `Only ${availability.availableSeats} seats are available`,
      );
    }

    // 3. Calculate total amount
    const pricePerSeat = 100;

    const totalAmount = seats * pricePerSeat;

    // 4. Create booking
    const booking =
      await this.bookingModel.create({
        userId,
        scheduleId,
        journeyDate,
        fromStationId,
        toStationId,
        seats,
        totalAmount,
        status: BookingStatus.CONFIRMED,
      });

    // 5. Return booking
    return booking;
  }


  async findBookingsByUserId(userId: string) {
    return this.bookingModel
    .find({ userId })
    // .populate('scheduleId')
    .populate('fromStationId')
    .populate('toStationId')
    .sort({ createdAt: -1 })
    .exec();
  }

  // async findBookingById(id: string) {
  //   return this.bookingModel
  //   .findById(id)
  //   .sort({ createdAt: -1 })
  //   .exec();
  // }

  async findOneBookingByUserIdandBookingId(
    bookingId: string,
    userId: string,
  ) {
    const booking =
      await this.bookingModel.findOne({
        _id: bookingId,
        userId: userId,
      }).populate('schedule').exec();

    if (!booking) {
      throw new NotFoundException(
        'Booking not found',
      );
    }

    return booking;
  }

  // TODO: later
    // └── cancel booking

  
}
