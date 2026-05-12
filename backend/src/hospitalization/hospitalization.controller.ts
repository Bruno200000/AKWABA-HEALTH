import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { HospitalizationService } from './hospitalization.service';

@Controller('hospitalization')
export class HospitalizationController {
  constructor(private readonly hospitalizationService: HospitalizationService) {}

  @Get('rooms')
  async findAllRooms(@Query('hospital_id') hospitalId: string) {
    return this.hospitalizationService.findAllRooms(hospitalId);
  }

  @Post('admissions')
  async admitPatient(@Body() admissionData: any, @Query('hospital_id') hospitalId: string) {
    return this.hospitalizationService.admitPatient(admissionData, hospitalId);
  }
}
