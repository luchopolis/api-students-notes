import { Module } from '@nestjs/common';
import { ExcelModule } from './excel/excel.module.js';

@Module({
  imports: [ExcelModule]
})
export class SharedModule {}
