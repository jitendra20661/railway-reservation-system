import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { ScheduleService } from './schedule.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { Query } from '@nestjs/common';
import { SearchScheduleDto } from './dto/search-schedule.dto';
import { Public } from 'src/auth/decorators/public.decorator';
import { PermissionGuard } from 'src/permission/guards/permission.guard';
import { RequirePermission } from 'src/permission/decorator/permission.decorator';
import { PermissionAction, PermissionResource } from 'src/permission/enums/permission.enum';

@Controller('schedule')
@UseGuards(PermissionGuard)
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}


  @Get('search')
  search(@Query() searchScheduleDto: SearchScheduleDto) {
    return this.scheduleService.search(searchScheduleDto);
  }
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.scheduleService.findById(id);
  }


  @Post()
  @RequirePermission(PermissionResource.SCHEDULES, PermissionAction.CREATE)
  create(@Body() createScheduleDto: CreateScheduleDto) {
    return this.scheduleService.create(createScheduleDto);
  }

  @Get()
  @RequirePermission(PermissionResource.SCHEDULES, PermissionAction.READ)
  findAll() {
    return this.scheduleService.findAll();
  }

  @Delete(':id')
  @RequirePermission(PermissionResource.SCHEDULES, PermissionAction.DELETE)
  remove(@Param('id') id: string) {
    return this.scheduleService.remove(id);
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




}
