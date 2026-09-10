import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { TrainService } from './train.service';
import { CreateTrainDto } from './dto/create-train.dto';
import { UpdateTrainDto } from './dto/update-train.dto';
import { Public } from 'src/auth/decorators/public.decorator';

@Public()
@Controller('train')
export class TrainController {
  constructor(
    private readonly trainService: TrainService,
  ) {}

  @Post()
  create(@Body() createTrainDto: CreateTrainDto) {
    return this.trainService.create(createTrainDto);
  }

  @Get()
  findAll() {
    return this.trainService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.trainService.findById(id);
  }

  // @Patch(':id')
  // update(
  //   @Param('id') id: string,
  //   @Body() updateTrainDto: UpdateTrainDto,
  // ) {
  //   return this.trainService.update(
  //     id,
  //     updateTrainDto,
  //   );
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.trainService.remove(id);
  // }
}