import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Role } from '../enums/role.enum';
import { PermissionAction, PermissionResource } from '../../permission/enums/permission.enum';


export type UserDocument = HydratedDocument<User>;




@Schema({ _id: false })
export class Permission {
  @Prop({
    required: true,
    enum: PermissionResource,
  })
  resource: PermissionResource;

  @Prop({
    type: [String],
    enum: PermissionAction,
    default: [],
  })
  actions: PermissionAction[];
}



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

  @Prop({type: [Permission],default: [],})
  permissions: Permission[];

  @Prop({type: Boolean,default: true,})
  isActive: boolean;

  @Prop({type: Types.ObjectId,ref: 'User',default: null,})
  createdBy: Types.ObjectId | null;
}

export const UserSchema = SchemaFactory.createForClass(User);