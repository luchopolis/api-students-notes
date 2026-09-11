import { Controller, Get } from '@nestjs/common';
import { PocExcelUseCase } from '../../application/use-cases/poc-excel.js';

@Controller('excel')
export class ExcelController {
  constructor(private readonly pocUseCase: PocExcelUseCase) { }

  @Get('/poc')
  async excelLoad() {
    await this.pocUseCase.execute()
    return 'done';
  }
}
