import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { FinanceService } from './finance.service';

@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('invoices')
  async findAllInvoices(@Query('hospital_id') hospitalId: string) {
    return this.financeService.findAllInvoices(hospitalId);
  }

  @Post('invoices')
  async createInvoice(@Body() invoiceData: any, @Query('hospital_id') hospitalId: string) {
    return this.financeService.createInvoice(invoiceData, hospitalId);
  }

  @Post('payments')
  async recordPayment(@Body() paymentData: any, @Query('hospital_id') hospitalId: string) {
    return this.financeService.recordPayment(paymentData, hospitalId);
  }
}
