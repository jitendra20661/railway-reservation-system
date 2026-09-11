import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type StationDocument = HydratedDocument<Station>;

@Schema({ timestamps: true })
export class Station {
  @Prop({
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  })
  stationCode: string;

  @Prop({
    required: true,
    trim: true,
  })
  name: string;

  @Prop({
    required: true,
    trim: true,
  })
  city: string;

  @Prop({
    required: true,
    trim: true,
  })
  state: string;

  @Prop({
    required: true,
    min: 0,
  })
  distanceFromRoha: number;

  @Prop({
    type: {
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
    },
    required: true,
  })
  geolocation: {
    latitude: number;
    longitude: number;
  };

  @Prop({
    default: true,
  })
  isActive: boolean;
}

export const StationSchema = SchemaFactory.createForClass(Station);



// Later in React map simply do:
// <Marker
//   position={[
//     station.geolocation.latitude,
//     station.geolocation.longitude,
//   ]}
// />