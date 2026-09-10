import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
  IsNumber,
  IsPositive,
} from 'class-validator';

// import { TrainType } from '../schemas/train.schema';

export class CreateTrainDto {
  @IsString()
  @IsNotEmpty()
  trainNumber: string;

  @IsString()
  @IsNotEmpty()
  name: string;

//   @IsEnum(TrainType)
//   type: TrainType;

  @IsNumber()
  @IsPositive()
  capacity: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}