import { Controller, Get, Patch, Param, Body, Query } from '@nestjs/common';
import { PharmacyService } from './pharmacy.service';

@Controller('pharmacy')
export class PharmacyController {
  constructor(private readonly pharmacyService: PharmacyService) {}

  @Get()
  async findAll(@Query('hospital_id') hospitalId: string) {
    return this.pharmacyService.findAll(hospitalId);
  }

  @Patch('stock/:id')
  async updateStock(
    @Param('id') id: string, 
    @Body('quantity') quantity: number,
    @Query('hospital_id') hospitalId: string
  ) {
    return this.pharmacyService.updateStock(id, quantity, hospitalId);
  }
}
