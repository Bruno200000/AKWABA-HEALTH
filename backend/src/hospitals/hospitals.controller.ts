import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { HospitalsService } from './hospitals.service';

@Controller('hospitals')
export class HospitalsController {
  constructor(private readonly hospitalsService: HospitalsService) {}

  @Get()
  async findAll() {
    return this.hospitalsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.hospitalsService.findOne(id);
  }

  @Post()
  async create(@Body() hospitalData: any) {
    return this.hospitalsService.create(hospitalData);
  }
}
