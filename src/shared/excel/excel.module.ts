import { Module } from '@nestjs/common';
import { ExcelService } from './services/excel.service.js';
import { ExcelController } from './infrastructure/presentation/excel.controller.js';
import { PocExcelUseCase } from './application/use-cases/poc-excel.js';
import { ParseStudentsToJson } from './application/use-cases/parse-students-to-json.js';
import { FillPeriodNotesUseCase } from './application/use-cases/fill-period-notes.js';

@Module({
  providers: [ExcelService, PocExcelUseCase, ParseStudentsToJson, FillPeriodNotesUseCase],
  controllers: [ExcelController],
  exports: [ParseStudentsToJson, FillPeriodNotesUseCase],
})
export class ExcelModule {}
