import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsBoolean,
  Min,
  Max,
  Length,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class GeolocationDto {
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;
}

export class CreateStationDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 10)
  stationCode: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsNumber()
  @Min(0)
  distanceFromRoha: number;

//   @ValidateNested()
//   @Type(() => GeolocationDto)
//   geolocation: GeolocationDto;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}