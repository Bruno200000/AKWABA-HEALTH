import { Controller, Get, Query } from '@nestjs/common';
import { StaffService } from './staff.service';

@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Get()
  async findAll(@Query('hospital_id') hospitalId: string) {
    return this.staffService.findAll(hospitalId);
  }

  @Get('role')
  async findByRole(@Query('hospital_id') hospitalId: string, @Query('role') role: string) {
    return this.staffService.findByRole(hospitalId, role);
  }
}
