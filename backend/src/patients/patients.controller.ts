import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { PatientsService } from './patients.service';

@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get()
  async findAll(@Query('hospital_id') hospitalId: string) {
    return this.patientsService.findAll(hospitalId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Query('hospital_id') hospitalId: string) {
    return this.patientsService.findOne(id, hospitalId);
  }

  @Post()
  async create(@Body() patientData: any, @Query('hospital_id') hospitalId: string) {
    return this.patientsService.create(patientData, hospitalId);
  }
}
