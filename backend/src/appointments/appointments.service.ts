import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class AppointmentsService {
  private readonly logger = new Logger(AppointmentsService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll(hospitalId: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('appointments')
      .select('*, patients(first_name, last_name), profiles(first_name, last_name)')
      .eq('hospital_id', hospitalId);

    if (error) {
      this.logger.error(`Error fetching appointments: ${error.message}`);
      throw new Error(error.message);
    }
    return data;
  }

  async create(appointmentData: any, hospitalId: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('appointments')
      .insert([{ ...appointmentData, hospital_id: hospitalId }])
      .select()
      .single();

    if (error) {
      this.logger.error(`Error creating appointment: ${error.message}`);
      throw new Error(error.message);
    }
    return data;
  }
}
