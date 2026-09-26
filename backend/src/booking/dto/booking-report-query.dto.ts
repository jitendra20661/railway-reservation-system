import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { BookingStatus } from '../../booking/schemas/booking.schema';
import { Type } from 'class-transformer';

export enum BookingReportStatus {
  ALL = 'ALL',
  PENDING = BookingStatus.PENDING,
  CONFIRMED = BookingStatus.CONFIRMED,
  CANCELLED = BookingStatus.CANCELLED,
}

export class BookingReportQueryDto {

  @IsOptional()
  @IsDateString()
  from: string;

  @IsOptional()
  @IsDateString()
  to: string;

  @IsOptional()
  @IsEnum(BookingReportStatus)
  status?: BookingReportStatus;

  @IsOptional()
  trainId?: string;

  @IsOptional()
  fromStationId?: string;

  @IsOptional()
  toStationId?: string;

    // Search
  @IsOptional()
  @IsString()
  search?: string;

  // Pagination
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;
}