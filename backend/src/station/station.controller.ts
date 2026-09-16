import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { StationService } from './station.service';
import { CreateStationDto } from './dto/create-station.dto';
import { UpdateStationDto } from './dto/update-station.dto';
import { Public } from 'src/auth/decorators/public.decorator';
import { RequirePermission } from 'src/permission/decorator/permission.decorator';
import { PermissionAction, PermissionResource } from 'src/permission/enums/permission.enum';

// @Public()
@Controller('station')
export class StationController {
  constructor(private readonly stationService: StationService) {}

  @Post()
  // @RequirePermission(PermissionResource.STATION, PermissionAction.CREATE)
  create(@Body() createStationDto: CreateStationDto) {
    return this.stationService.create(createStationDto);
  }

  @Get()
  // @RequirePermission(PermissionResource.STATION, PermissionAction.READ)
  findAll() {
    return this.stationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stationService.findById(id);
  }

  // TODO: later
  // @Patch(':id')
  // @RequirePermission(PermissionResource.STATION, PermissionAction.UPDATE)
  // update(@Param('id') id: string, @Body() updateStationDto: UpdateStationDto) {
  //   return this.stationService.update(+id, updateStationDto);
  // }

  @Delete(':id')
  @RequirePermission(PermissionResource.STATIONS, PermissionAction.DELETE)
  remove(@Param('id') id: string) {
    return this.stationService.remove(id);
  }
}
