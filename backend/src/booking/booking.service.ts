import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  Booking,
  BookingDocument,
  BookingStatus,
} from './schemas/booking.schema';

import { ScheduleService } from '../schedule/schedule.service';
import { StationService } from '../station/station.service';
import { TrainService } from './../train/train.service';

import { Train, TrainDocument } from '../train/schemas/train.schema';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingReportQueryDto, BookingReportStatus } from './dto/booking-report-query.dto';
import { Schedule, ScheduleDocument } from 'src/schedule/schemas/schedule.schema';
import { User, UserDocument } from 'src/user/schemas/user.schema';
import { Station, StationDocument } from 'src/station/schemas/station.schema';




@Injectable()
export class BookingService {

constructor(
  @InjectModel(Booking.name)
  private readonly bookingModel: Model<BookingDocument>,

  @InjectModel(Schedule.name)
  private readonly scheduleModel: Model<ScheduleDocument>,

  @InjectModel(User.name)
  private readonly userModel: Model<UserDocument>,

  @InjectModel(Station.name)
  private readonly stationModel: Model<StationDocument>,

  @InjectModel(Train.name)
  private readonly trainModel: Model<TrainDocument>,

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

    //testing:
    console.log(
      'scheduleId schema type:',
      this.bookingModel.schema.path('scheduleId').instance,
    );

    console.log(
      'userId schema type:',
      this.bookingModel.schema.path('userId').instance,
    );

    console.log(
      'fromStationId schema type:',
      this.bookingModel.schema.path('fromStationId').instance,
    );

    console.log(
      'toStationId schema type:',
      this.bookingModel.schema.path('toStationId').instance,
    );

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
    // .populate({
    //   path: "scheduleId",
    //   populate: {
    //     path: "trainId",
    //     select: "trainNumber name",
    //   },
    // })
    // .populate('fromStationId')
    // .populate('toStationId')
    // .sort({ createdAt: -1 })
    // .exec();
    .populate({
      path: "userId",
      select: "name email",
    })
    .populate({
      path: "scheduleId",
      populate: {
        path: "trainId",
        select: "trainNumber name",
      },
    })
    .populate({
      path: "fromStationId",
      select: "stationCode name",
    })
    .populate({
      path: "toStationId",
      select: "stationCode name",
    })
    .sort({
      journeyDate: -1,
      createdAt: -1,
    })
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


    async getBookingReport(query: BookingReportQueryDto) {
  const {
    from,
    to,
    status = BookingReportStatus.ALL,
    trainId,
    fromStationId,
    toStationId,
    search,
    page = 1,
    limit = 20,
  } = query;


  const currentPage = Math.max(1, Number(page));
  const currentLimit = Math.min(
    100,
    Math.max(1, Number(limit)),
  );

  const skip = (currentPage - 1) * currentLimit;

  const filter: any = {};

  if (from && to) {
    filter.journeyDate = {
      $gte: from,
      $lte: to,
    };
  }
  if (status !== BookingReportStatus.ALL) {
    filter.status = status;
  }
  if (fromStationId) {
    filter.fromStationId = fromStationId;
  }

  if (toStationId) {
    filter.toStationId = toStationId;
  }

  if (trainId) {
    const schedules = await this.scheduleModel
      .find({
        trainId,
      })
      .select("_id")
      .lean();

    const scheduleIds = schedules.map(
      (schedule) => schedule._id,
    );

    if (scheduleIds.length === 0) {
      return {
        bookings: [],

        pagination: {
          page: currentPage,
          limit: currentLimit,
          total: 0,
          totalPages: 0,
        },

        summary: {
          totalBookings: 0,
          totalSeats: 0,
          confirmedBookings: 0,
          pendingBookings: 0,
          cancelledBookings: 0,
        },
      };
    }

    filter.scheduleId = {
      $in: scheduleIds,
    };
  }

  if (search?.trim()) {
    const searchText = search.trim();

    const escapedSearch = searchText.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&",
    );

    const searchRegex = new RegExp(
      escapedSearch,
      "i",
    );

    const users = await this.userModel
      .find({
        $or: [
          { name: searchRegex },
          { email: searchRegex },
        ],
      })
      .select("_id")
      .lean();

    const userIds = users.map(
      (user) => user._id,
    );

    /*
     * Search stations.
     */
    const stations = await this.stationModel
      .find({
        $or: [
          { stationCode: searchRegex },
          { name: searchRegex },
        ],
      })
      .select("_id")
      .lean();

    const stationIds = stations.map(
      (station) => station._id,
    );


    const trains = await this.trainModel
      .find({
        $or: [
          { trainNumber: searchRegex },
          { name: searchRegex },
        ],
      })
      .select("_id")
      .lean();

    const trainIds = trains.map(
      (train) => train._id,
    );

    let searchScheduleIds: any[] = [];

    if (trainIds.length > 0) {
      const schedules = await this.scheduleModel
        .find({
          trainId: {
            $in: trainIds,
          },
        })
        .select("_id")
        .lean();

      searchScheduleIds = schedules.map(
        (schedule) => schedule._id,
      );
    }

    let bookingIdMatch: any = null;

    if (Types.ObjectId.isValid(searchText)) {
      bookingIdMatch = new Types.ObjectId(
        searchText,
      );
    }

    const searchConditions: any[] = [];

    if (bookingIdMatch) {
      searchConditions.push({
        _id: bookingIdMatch,
      });
    }

    if (userIds.length > 0) {
      searchConditions.push({
        userId: {
          $in: userIds,
        },
      });
    }

    if (stationIds.length > 0) {
      searchConditions.push({
        fromStationId: {
          $in: stationIds,
        },
      });

      searchConditions.push({
        toStationId: {
          $in: stationIds,
        },
      });
    }

    if (searchScheduleIds.length > 0) {
      searchConditions.push({
        scheduleId: {
          $in: searchScheduleIds,
        },
      });
    }

    if (searchConditions.length === 0) {
      return {
        bookings: [],

        pagination: {
          page: currentPage,
          limit: currentLimit,
          total: 0,
          totalPages: 0,
        },

        summary: {
          totalBookings: 0,
          totalSeats: 0,
          confirmedBookings: 0,
          pendingBookings: 0,
          cancelledBookings: 0,
        },
      };
    }

    filter.$or = searchConditions;
  }

  const totalBookings =
    await this.bookingModel.countDocuments(filter);


  //  * Summary is calculated over the COMPLETE filtered dataset, not just the current page.
  const summaryResult =
    await this.bookingModel.aggregate([
      {
        $match: filter,
      },

      {
        $group: {
          _id: null,

          totalBookings: {
            $sum: 1,
          },

          totalSeats: {
            $sum: "$seats",
          },

          confirmedBookings: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$status",
                    BookingStatus.CONFIRMED,
                  ],
                },
                1,
                0,
              ],
            },
          },

          pendingBookings: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$status",
                    BookingStatus.PENDING,
                  ],
                },
                1,
                0,
              ],
            },
          },

          cancelledBookings: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$status",
                    BookingStatus.CANCELLED,
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

  const summary =
    summaryResult[0] ?? {
      totalBookings: 0,
      totalSeats: 0,
      confirmedBookings: 0,
      pendingBookings: 0,
      cancelledBookings: 0,
    };

  //=====CURRENT PAGE=====
  const bookings = await this.bookingModel
    .find(filter)
    .populate({
      path: "userId",
      select: "name email",
    })
    .populate({
      path: "scheduleId",
      populate: {
        path: "trainId",
        select: "trainNumber name",
      },
    })
    .populate({
      path: "fromStationId",
      select: "stationCode name",
    })
    .populate({
      path: "toStationId",
      select: "stationCode name",
    })
    .sort({
      journeyDate: -1,
      createdAt: -1,
    })
    .skip(skip)
    .limit(currentLimit)
    .exec();

  // ===PAGINATION====
  const totalPages =
    totalBookings === 0
      ? 0
      : Math.ceil(
          totalBookings / currentLimit,
        );

  //===== RESPONSE=====
  return {
    bookings: bookings.map(
      (booking: any) => ({
        _id: booking._id,

        journeyDate:
          booking.journeyDate,

        seats: booking.seats,

        status: booking.status,

        totalAmount:
          booking.totalAmount,

        createdAt:
          booking.createdAt,

        user: booking.userId
          ? {
              _id: booking.userId._id,

              name:
                booking.userId.name,

              email:
                booking.userId.email,
            }
          : null,

        train:
          booking.scheduleId?.trainId
            ? {
                _id:
                  booking.scheduleId
                    .trainId._id,

                trainNumber:
                  booking.scheduleId
                    .trainId.trainNumber,

                name:
                  booking.scheduleId
                    .trainId.name,
              }
            : null,

        fromStation:
          booking.fromStationId
            ? {
                _id:
                  booking.fromStationId._id,

                stationCode:
                  booking.fromStationId
                    .stationCode,

                name:
                  booking.fromStationId.name,
              }
            : null,

        toStation:
          booking.toStationId
            ? {
                _id:
                  booking.toStationId._id,

                stationCode:
                  booking.toStationId
                    .stationCode,

                name:
                  booking.toStationId.name,
              }
            : null,
      }),
    ),

    summary: {
      totalBookings:
        summary.totalBookings,

      totalSeats:
        summary.totalSeats,

      confirmedBookings:
        summary.confirmedBookings,

      pendingBookings:
        summary.pendingBookings,

      cancelledBookings:
        summary.cancelledBookings,
    },

    pagination: {
      page: currentPage,

      limit: currentLimit,

      total: totalBookings,

      totalPages,
    },
  };
}
  
}
