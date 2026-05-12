import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class FinanceService {
  private readonly logger = new Logger(FinanceService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async findAllInvoices(hospitalId: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('invoices')
      .select('*, patients(first_name, last_name)')
      .eq('hospital_id', hospitalId);

    if (error) {
      this.logger.error(`Error fetching invoices: ${error.message}`);
      throw new Error(error.message);
    }
    return data;
  }

  async createInvoice(invoiceData: any, hospitalId: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('invoices')
      .insert([{ ...invoiceData, hospital_id: hospitalId }])
      .select()
      .single();

    if (error) {
      this.logger.error(`Error creating invoice: ${error.message}`);
      throw new Error(error.message);
    }
    return data;
  }

  async recordPayment(paymentData: any, hospitalId: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('payments')
      .insert([{ ...paymentData, hospital_id: hospitalId }])
      .select()
      .single();

    if (error) {
      this.logger.error(`Error recording payment: ${error.message}`);
      throw new Error(error.message);
    }

    // Update invoice status if needed
    // (Logic could be more complex: partial payments, etc.)
    
    return data;
  }
}
