import { Injectable, InternalServerErrorException } from '@nestjs/common';

import ExcelJs from 'exceljs'
import { dirname, join} from 'node:path';
import { fileURLToPath } from 'node:url';
import jszip, { JSZipObject } from 'jszip';

const __dirname = dirname(fileURLToPath(import.meta.url));

@Injectable()
export class ExcelService {

  async openExcelFile(excelPath?: string, pageToLoad: number = 1) {
    console.log(__dirname)
    const workbook = new ExcelJs.Workbook()

    const filePath = join(__dirname, 'archivo.xlsx')
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

  async saveExcelChanges(workBook: ExcelJs.Workbook) {
    await workBook.xlsx.writeFile(join(__dirname, 'archivo.xlsx'))
  }

  async convertWorkbookToBuffer(workbook: ExcelJs.Workbook): Promise<jszip | null> {
    const excelBuffer = await workbook.xlsx.writeBuffer()
    const zip = await jszip.loadAsync(excelBuffer)
    return zip
  }
}
