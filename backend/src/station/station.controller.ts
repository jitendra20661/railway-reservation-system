import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { StationService } from './station.service';
import { CreateStationDto } from './dto/create-station.dto';
import { UpdateStationDto } from './dto/update-station.dto';
import { Public } from 'src/auth/decorators/public.decorator';

@Public()
@Controller('station')
export class StationController {
  constructor(private readonly stationService: StationService) {}

  @Post()
  create(@Body() createStationDto: CreateStationDto) {
    return this.stationService.create(createStationDto);
  }

  @Get()
  findAll() {
    return this.stationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stationService.findById(id);
  }

  // TODO: later
  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateStationDto: UpdateStationDto) {
  //   return this.stationService.update(+id, updateStationDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.stationService.remove(+id);
  // }
}
