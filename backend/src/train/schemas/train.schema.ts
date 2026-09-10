import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TrainDocument = HydratedDocument<Train>;

// export enum TrainType {
//   EXPRESS = 'EXPRESS',
//   SUPERFAST = 'SUPERFAST',
//   MAIL = 'MAIL',
//   PASSENGER = 'PASSENGER',
//   SHATABDI = 'SHATABDI',
//   RAJDHANI = 'RAJDHANI',
//   DURONTO = 'DURONTO',
// }

@Schema({ timestamps: true })
export class Train {
  @Prop({
    required: true,
    unique: true,
    trim: true,
  })
  trainNumber: string;

  @Prop({
    required: true,
    trim: true,
  })
  name: string;


  @Prop({required: true})
  capacity: number;

  @Prop({default: true})
  isActive: boolean;

//   @Prop({
//     required: true,
//     enum: TrainType,
//   })
//   type: TrainType;


}

export const TrainSchema = SchemaFactory.createForClass(Train);