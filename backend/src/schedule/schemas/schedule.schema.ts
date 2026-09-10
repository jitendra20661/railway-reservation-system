import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ScheduleDocument = HydratedDocument<Schedule>;

export enum ScheduleDirection {
  ROHA_TO_THOKUR = 'ROHA_TO_THOKUR',
  THOKUR_TO_ROHA = 'THOKUR_TO_ROHA',
}

export enum ScheduleStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Schema({ _id: false })
export class ScheduleStop {
  @Prop({
    type: Types.ObjectId,
    ref: 'Station',
    required: true,
  })
  stationId: Types.ObjectId;

  @Prop()
  arrivalTime?: string;

  @Prop()
  departureTime?: string;
}

@Schema({ timestamps: true })
export class Schedule {
  @Prop({
    type: Types.ObjectId,
    ref: 'Train',
    required: true,
  })
  trainId: Types.ObjectId;

  @Prop({
    required: true,
    enum: ScheduleDirection,
  })
  direction: ScheduleDirection;

  @Prop({
    type: [ScheduleStop],
    required: true,
    validate: {
      validator: (stops: ScheduleStop[]) => stops.length >= 2,
      message: 'A schedule must have at least two stops',
    },
  })
  stops: ScheduleStop[];

  @Prop({
    required: true,
    match: /^[01]{7}$/,
  })
  operatingDays: string;

  @Prop({
    required: true,
    enum: ScheduleStatus,
    default: ScheduleStatus.ACTIVE,
  })
  status: ScheduleStatus;
}

export const ScheduleSchema = SchemaFactory.createForClass(Schedule);