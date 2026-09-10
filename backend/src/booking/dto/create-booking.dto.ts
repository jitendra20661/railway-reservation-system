import {
  IsDateString,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  Min,
} from 'class-validator';

export class CreateBookingDto {
  @IsMongoId()
  @IsNotEmpty()
  scheduleId: string;

  @IsDateString()
  journeyDate: string;

  @IsMongoId()
  @IsNotEmpty()
  fromStationId: string;

  @IsMongoId()
  @IsNotEmpty()
  toStationId: string;

  @IsInt()
  @Min(1)
  seats: number;
}
