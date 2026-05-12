import { Controller, Get, Patch, Param, Body, Query } from '@nestjs/common';
import { LaboratoryService } from './laboratory.service';

@Controller('laboratory')
export class LaboratoryController {
  constructor(private readonly laboratoryService: LaboratoryService) {}

  @Get()
  async findAll(@Query('hospital_id') hospitalId: string) {
    return this.laboratoryService.findAll(hospitalId);
  }

  @Patch('results/:id')
  async updateResults(
    @Param('id') id: string, 
    @Body('results') results: any,
    @Query('hospital_id') hospitalId: string
  ) {
    return this.laboratoryService.updateResults(id, results, hospitalId);
  }
}
