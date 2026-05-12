import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ConsultationsService } from './consultations.service';

@Controller('consultations')
export class ConsultationsController {
  constructor(private readonly consultationsService: ConsultationsService) {}

  @Get()
  async findAll(@Query('hospital_id') hospitalId: string) {
    return this.consultationsService.findAll(hospitalId);
  }

  @Post()
  async create(@Body() consultationData: any, @Query('hospital_id') hospitalId: string) {
    return this.consultationsService.create(consultationData, hospitalId);
  }
}
