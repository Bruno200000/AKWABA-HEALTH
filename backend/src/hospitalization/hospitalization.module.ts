import { Module } from '@nestjs/common';
import { HospitalizationController } from './hospitalization.controller';
import { HospitalizationService } from './hospitalization.service';

@Module({
  controllers: [HospitalizationController],
  providers: [HospitalizationService],
})
export class HospitalizationModule {}
