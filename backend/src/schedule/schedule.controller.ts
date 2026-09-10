import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { ScheduleService } from './schedule.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { Query } from '@nestjs/common';
import { SearchScheduleDto } from './dto/search-schedule.dto';
import { Public } from 'src/auth/decorators/public.decorator';

@Public()
@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Post()
  create(@Body() createScheduleDto: CreateScheduleDto) {
    return this.scheduleService.create(createScheduleDto);
  }

  @Get()
  findAll() {
    return this.scheduleService.findAll();
  }

  @Get('search')
  search(@Query() searchScheduleDto: SearchScheduleDto) {
    return this.scheduleService.search(searchScheduleDto);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.scheduleService.findById(id);
  }

  // @Patch(':id')
  // update(
  //   @Param('id') id: string,
  //   @Body() updateScheduleDto: UpdateScheduleDto,
  // ) {
  //   return this.scheduleService.update(
  //     id,
  //     updateScheduleDto,
  //   );
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.scheduleService.remove(id);
  // }

}
