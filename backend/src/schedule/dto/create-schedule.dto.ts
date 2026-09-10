import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ScheduleDirection, ScheduleStatus } from '../schemas/schedule.schema';


class ScheduleStopDto {
  @IsNotEmpty()
  @IsString()
  stationId: string;

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'arrivalTime must be in HH:mm format',
  })
  arrivalTime?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'departureTime must be in HH:mm format',
  })
  departureTime?: string;
}

export class CreateScheduleDto {
  @IsNotEmpty()
  @IsString()
  trainId: string;

  @IsNotEmpty()
  @IsEnum(ScheduleDirection)
  direction: ScheduleDirection;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScheduleStopDto)
  stops: ScheduleStopDto[];

  @IsNotEmpty()
  @IsString()
  @Matches(/^[01]{7}$/, {
    message: 'operatingDays must contain exactly 7 binary digits',
  })
  operatingDays: string;

  @IsOptional()
  @IsEnum(ScheduleStatus)
  status?: ScheduleStatus;
}