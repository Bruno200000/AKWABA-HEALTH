import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class ConsultationsService {
  private readonly logger = new Logger(ConsultationsService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll(hospitalId: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('consultations')
      .select('*, patients(first_name, last_name), profiles(first_name, last_name)')
      .eq('hospital_id', hospitalId);

    if (error) {
      this.logger.error(`Error fetching consultations: ${error.message}`);
      throw new Error(error.message);
    }
    return data;
  }

  async create(consultationData: any, hospitalId: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('consultations')
      .insert([{ ...consultationData, hospital_id: hospitalId }])
      .select()
      .single();

    if (error) {
      this.logger.error(`Error creating consultation: ${error.message}`);
      throw new Error(error.message);
    }
    return data;
  }
}
