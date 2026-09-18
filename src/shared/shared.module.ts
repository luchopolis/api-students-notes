import { Module } from '@nestjs/common';
import { ExcelModule } from './excel/excel.module.js';
import { StorageModule } from './storage/storage.module.js';

@Module({
  imports: [ExcelModule, StorageModule]
})
export class SharedModule {}
