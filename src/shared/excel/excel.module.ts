import { Module } from '@nestjs/common';
import { ExcelService } from './services/excel.service.js';
import { ExcelController } from './infrastructure/presentation/excel.controller.js';
import { PocExcelUseCase } from './application/use-cases/poc-excel.js';

@Module({
  providers: [ExcelService, PocExcelUseCase],
  controllers: [ExcelController]
})
export class ExcelModule {}
