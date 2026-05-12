import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class LaboratoryService {
  private readonly logger = new Logger(LaboratoryService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll(hospitalId: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('lab_tests')
      .select('*, patients(first_name, last_name), profiles(first_name, last_name)')
      .eq('hospital_id', hospitalId);

    if (error) {
      this.logger.error(`Error fetching lab tests: ${error.message}`);
      throw new Error(error.message);
    }
    return data;
  }

  async updateResults(testId: string, resultsData: any, hospitalId: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('lab_tests')
      .update({ results_data: resultsData, status: 'COMPLETED' })
      .eq('id', testId)
      .eq('hospital_id', hospitalId)
      .select()
      .single();

    if (error) {
      this.logger.error(`Error updating lab results for test ${testId}: ${error.message}`);
      throw new Error(error.message);
    }
    return data;
  }
}
