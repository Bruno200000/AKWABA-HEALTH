import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class StaffService {
  private readonly logger = new Logger(StaffService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll(hospitalId: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('profiles')
      .select('*')
      .eq('hospital_id', hospitalId);

    if (error) {
      this.logger.error(`Error fetching staff: ${error.message}`);
      throw new Error(error.message);
    }
    return data;
  }

  async findByRole(hospitalId: string, role: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('profiles')
      .select('*')
      .eq('hospital_id', hospitalId)
      .eq('role', role);

    if (error) {
      this.logger.error(`Error fetching staff by role ${role}: ${error.message}`);
      throw new Error(error.message);
    }
    return data;
  }
}
