import { Controller, Get, Query } from '@nestjs/common';
import { PocExcelUseCase } from '../../application/use-cases/poc-excel.js';

@Controller('excel')
export class ExcelController {
  constructor(private readonly pocUseCase: PocExcelUseCase) { }

  @Get('/poc')
  async excelLoad(@Query() qparams: { period: 'First' | "Second"  }) {
    await this.pocUseCase.execute(qparams.period)
    return 'done';
  }
}
