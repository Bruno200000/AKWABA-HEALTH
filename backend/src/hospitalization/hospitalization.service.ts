import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class HospitalizationService {
  private readonly logger = new Logger(HospitalizationService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async findAllRooms(hospitalId: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('rooms')
      .select('*')
      .eq('hospital_id', hospitalId);

    if (error) {
      this.logger.error(`Error fetching rooms: ${error.message}`);
      throw new Error(error.message);
    }
    return data;
  }

  async admitPatient(admissionData: any, hospitalId: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('admissions')
      .insert([{ ...admissionData, hospital_id: hospitalId }])
      .select()
      .single();

    if (error) {
      this.logger.error(`Error admitting patient: ${error.message}`);
      throw new Error(error.message);
    }

    // Update room occupancy
    if (admissionData.room_id) {
       await this.supabaseService.getClient().rpc('increment_room_occupancy', { room_id: admissionData.room_id });
    }

    return data;
  }
}
