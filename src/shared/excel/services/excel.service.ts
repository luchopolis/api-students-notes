import { Injectable, InternalServerErrorException } from '@nestjs/common';

import ExcelJs from 'exceljs'
import { dirname, join} from 'node:path';
import { fileURLToPath } from 'node:url';
import jszip, { JSZipObject } from 'jszip';
import { EMPTY_EXCEL_FILE_NAME } from '../domain/helpers/period-mapped';

const __dirname = dirname(fileURLToPath(import.meta.url));

@Injectable()
export class ExcelService {

  async openExcelFile(fileName: string, excelPath?: string, pageToLoad: number = 1) {
    const workbook = new ExcelJs.Workbook()

    const filePath = join(__dirname, fileName)
    try {
      await workbook.xlsx.readFile(filePath)
      const worksheet = workbook.getWorksheet(pageToLoad)
      return {
        worksheet,
        workbook
      };
    } catch (error) {
      console.log(error)
      throw new InternalServerErrorException("Failed open file")
    }
  }

  async saveExcelChanges(workBook: ExcelJs.Workbook, fileName: string) {
    await workBook.xlsx.writeFile(join(__dirname, fileName))
  }

  async convertWorkbookToBuffer(workbook: ExcelJs.Workbook): Promise<jszip | null> {
    const excelBuffer = await workbook.xlsx.writeBuffer()
    const zip = await jszip.loadAsync(excelBuffer)
    return zip
  }
}
