import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get()
  async findAll(@Query('hospital_id') hospitalId: string) {
    return this.appointmentsService.findAll(hospitalId);
  }

  @Post()
  async create(@Body() appointmentData: any, @Query('hospital_id') hospitalId: string) {
    return this.appointmentsService.create(appointmentData, hospitalId);
  }
}
