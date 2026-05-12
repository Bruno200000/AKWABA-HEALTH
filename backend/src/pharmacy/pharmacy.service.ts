import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class PharmacyService {
  private readonly logger = new Logger(PharmacyService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll(hospitalId: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('medicines')
      .select('*')
      .eq('hospital_id', hospitalId);

    if (error) {
      this.logger.error(`Error fetching medicines: ${error.message}`);
      throw new Error(error.message);
    }
    return data;
  }

  async updateStock(medicineId: string, quantity: number, hospitalId: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('medicines')
      .update({ stock_quantity: quantity })
      .eq('id', medicineId)
      .eq('hospital_id', hospitalId)
      .select()
      .single();

    if (error) {
      this.logger.error(`Error updating stock for medicine ${medicineId}: ${error.message}`);
      throw new Error(error.message);
    }
    return data;
  }
}
