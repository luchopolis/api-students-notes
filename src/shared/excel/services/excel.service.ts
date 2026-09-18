import { Injectable, InternalServerErrorException } from '@nestjs/common';

import ExcelJs from 'exceljs'
import { dirname, join} from 'node:path';
import { fileURLToPath } from 'node:url';
import jszip, { JSZipObject } from 'jszip';
import { EMPTY_EXCEL_FILE_NAME } from '../domain/helpers/period-mapped.js';

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

  async openExcelFileFromBuffer(file: Buffer, pageToLoad: number = 1) {
    try {
      const workbook = new ExcelJs.Workbook()
      await workbook.xlsx.load(file as any)

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

  /**
   * Serializa el workbook forzando a Excel a recalcular todas las fórmulas al abrir:
   * limpia el resultado en caché de cada fórmula de la hoja y marca `fullCalcOnLoad`.
   * Sin esto, las celdas de promedio se ven vacías o desactualizadas hasta recalcular a mano.
   */
  async toRecalculatingBuffer(workbook: ExcelJs.Workbook, worksheet: ExcelJs.Worksheet): Promise<Buffer> {
    worksheet.eachRow({ includeEmpty: false }, (row) => {
      row.eachCell({ includeEmpty: false }, (cell) => {
        if (cell.type === ExcelJs.ValueType.Formula || cell.formula) {
          cell.value = { formula: cell.formula, result: undefined }
        }
      })
    })

    const zip = await this.convertWorkbookToBuffer(workbook)
    const workbookXml = zip?.file('xl/workbook.xml')
    if (!zip || !workbookXml) {
      throw new InternalServerErrorException("Failed to prepare workbook")
    }

    const calcPrTag = '<calcPr calcId="0" calcMode="auto" fullCalcOnLoad="1" forceFullCalc="1"/>'
    let xml = await workbookXml.async('string')
    if (xml.includes('<calcPr')) {
      xml = xml.replace(/<calcPr[^>]*\/>|<calcPr[^>]*>[\s\S]*?<\/calcPr>/g, calcPrTag)
    } else if (xml.includes('</sheets>')) {
      xml = xml.replace('</sheets>', `</sheets>${calcPrTag}`)
    } else {
      xml = xml.replace('</workbook>', `${calcPrTag}</workbook>`)
    }
    zip.file('xl/workbook.xml', xml)

    return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' })
  }
}
