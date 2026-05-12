import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ConfigModule } from '@nestjs/config';
import { SupabaseModule } from './supabase/supabase.module';
import { PatientsModule } from './patients/patients.module';
import { StaffModule } from './staff/staff.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { ConsultationsModule } from './consultations/consultations.module';
import { PharmacyModule } from './pharmacy/pharmacy.module';
import { LaboratoryModule } from './laboratory/laboratory.module';
import { FinanceModule } from './finance/finance.module';
import { HospitalizationModule } from './hospitalization/hospitalization.module';
import { HospitalsModule } from './hospitals/hospitals.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SupabaseModule,
    PatientsModule,
    StaffModule,
    AppointmentsModule,
    ConsultationsModule,
    PharmacyModule,
    LaboratoryModule,
    FinanceModule,
    HospitalizationModule,
    HospitalsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
