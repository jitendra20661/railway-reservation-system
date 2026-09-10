import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Role } from '../enums/role.enum';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {

  _id: Types.ObjectId;
  
  @Prop({type: String,required: true,trim: true,})
  name: string;

  @Prop({type: String,required: true,unique: true,lowercase: true,trim: true,})
  email: string;

  @Prop({required: true,})
  password: string;
  //never return password from your API responses. explicitly removing it before returning the user.

  @Prop({type: String,enum: Role,default: Role.USER,})
  role: Role;

  @Prop({type: [String],default: [],})
  permissions: string[];

  @Prop({type: Boolean,default: true,})
  isActive: boolean;

  @Prop({type: Types.ObjectId,ref: 'User',default: null,})
  createdBy: Types.ObjectId | null;
}

export const UserSchema = SchemaFactory.createForClass(User);