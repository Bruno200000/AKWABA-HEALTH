import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class PatientsService {
  private readonly logger = new Logger(PatientsService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll(hospitalId: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('patients')
      .select('*')
      .eq('hospital_id', hospitalId);

    if (error) {
      this.logger.error(`Error fetching patients: ${error.message}`);
      throw new Error(error.message);
    }
    return data;
  }

  async findOne(id: string, hospitalId: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('patients')
      .select('*')
      .eq('id', id)
      .eq('hospital_id', hospitalId)
      .single();

    if (error) {
      this.logger.error(`Error fetching patient ${id}: ${error.message}`);
      throw new Error(error.message);
    }
    return data;
  }

  async create(patientData: any, hospitalId: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('patients')
      .insert([{ ...patientData, hospital_id: hospitalId }])
      .select()
      .single();

    if (error) {
      this.logger.error(`Error creating patient: ${error.message}`);
      throw new Error(error.message);
    }
    return data;
  }
}
