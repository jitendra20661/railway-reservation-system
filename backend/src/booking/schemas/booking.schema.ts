import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type BookingDocument = HydratedDocument<Booking>;

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

@Schema({ timestamps: true })
export class Booking {
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  userId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'Schedule',
    required: true,
  })
  scheduleId: Types.ObjectId;

  @Prop({
    required: true,
  })
  journeyDate: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'Station',
    required: true,
  })
  fromStationId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'Station',
    required: true,
  })
  toStationId: Types.ObjectId;

  @Prop({
    required: true,
    min: 1,
  })
  seats: number;

  @Prop({
    required: true,
    min: 0,
  })
  totalAmount: number;

  @Prop({
    required: true,
    enum: BookingStatus,
    default: BookingStatus.PENDING,
  })
  status: BookingStatus;
}

export const BookingSchema =
  SchemaFactory.createForClass(Booking);