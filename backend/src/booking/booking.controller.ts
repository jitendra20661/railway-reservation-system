import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';

import { BookingService } from './booking.service';
import { Public } from 'src/auth/decorators/public.decorator';
import { CreateBookingDto } from './dto/create-booking.dto';
import { JWTAuthGuard } from 'src/auth/guards/jwtauth.guard';
import { PermissionGuard } from 'src/permission/guards/permission.guard';
import { RequirePermission } from 'src/permission/decorator/permission.decorator';
import { PermissionAction, PermissionResource } from 'src/permission/enums/permission.enum';
import { BookingReportQueryDto } from './dto/booking-report-query.dto';

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  // @Public()
  @Get('availability')
  getAvailability(
    @Query('scheduleId') scheduleId: string,
    @Query('fromStationId') fromStationId: string,
    @Query('toStationId') toStationId: string,
    @Query('journeyDate') journeyDate: string,
  ) {
    return this.bookingService.getAvailability(
      scheduleId,
      fromStationId,
      toStationId,
      journeyDate,
    );
  }


  @Post() 
  createBooking(@Req() req, @Body() createBookingDto: CreateBookingDto) {
    console.log("req.user= ", req.user)
    return this.bookingService.createBooking(req.user.sub, createBookingDto);
  }

  // @Public()
  @Get()
  // @RequirePermission(PermissionResource.BOOKING, PermissionAction.READ)
  getAllBooking(){
    return this.bookingService.getAllBooking();
  }


  
  @Get('my-bookings')
  getMyBookings(@Req() req) {
    return this.bookingService.findBookingsByUserId(req.user.sub);
  }

  @Get('report')
  // @UseGuards(JWTAuthGuard, PermissionGuard)
  @RequirePermission(PermissionResource.BOOKING, PermissionAction.READ)
  getBookingReport(@Query() query: BookingReportQueryDto){
    return this.bookingService.getBookingReport(query)
  }


  // @Get('id:')
  // findBookingById(@Req() req) {
  //   return this.bookingService.findBookingById();
  // }

  @Get(':id')
  findBookingByIdnUserId(
    @Param('id') bookingId: string,
    @Req() req,
  ) {
    return this.bookingService.findOneBookingByUserIdandBookingId(
      bookingId,
      req.user.sub,
    );
  }

  
}
