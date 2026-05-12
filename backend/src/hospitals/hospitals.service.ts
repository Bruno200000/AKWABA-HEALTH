import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class HospitalsService {
  private readonly logger = new Logger(HospitalsService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll() {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('hospitals')
      .select('*');

    if (error) {
      this.logger.error(`Error fetching hospitals: ${error.message}`);
      throw new Error(error.message);
    }
    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('hospitals')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      this.logger.error(`Error fetching hospital ${id}: ${error.message}`);
      throw new Error(error.message);
    }
    return data;
  }

  async create(hospitalData: any) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('hospitals')
      .insert([hospitalData])
      .select()
      .single();

    if (error) {
      this.logger.error(`Error creating hospital: ${error.message}`);
      throw new Error(error.message);
    }
    return data;
  }
}
