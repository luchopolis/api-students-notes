import { Injectable, NotFoundException } from "@nestjs/common";
import { ExcelService } from "../../services/excel.service.js";

import fs from 'fs'
import { EMPTY_EXCEL_FILE_NAME, FakeStudentsNotes, PeriodMapped, PeriodNotesColumnPosition, RowStartIndex, STUDENT_START_COLUMN } from "../../domain/helpers/period-mapped.js";

@Injectable()
export class PocExcelUseCase {

  constructor(private readonly pocExcelService: ExcelService) {}


  async execute() {
    const { workbook, worksheet: workSheetExcel } = await this.pocExcelService.openExcelFile(EMPTY_EXCEL_FILE_NAME)

    if (!workSheetExcel) {
      throw new NotFoundException("File Not Found");
    }


    // students
    const studentsColumn = workSheetExcel.getColumn(STUDENT_START_COLUMN)
    // fill with students
    for (let rowPosition = 0; rowPosition < FakeStudentsNotes.length; rowPosition++){
      const student = FakeStudentsNotes[rowPosition]
      const rowPositionCell = RowStartIndex + rowPosition;
      const row = workSheetExcel.getRow(rowPositionCell)
      row.getCell(STUDENT_START_COLUMN).value = student.name;
    

      // only first period
      const period = PeriodMapped['First']
      const totalNotesPeriodColumns = Object.keys(period)
      for (const noteColumn of totalNotesPeriodColumns) {
        if (noteColumn === PeriodNotesColumnPosition.FNote) {
          row.getCell(period.FNote).value = student.FNote
        }

        if (noteColumn === PeriodNotesColumnPosition.SNote) {
          row.getCell(period.SNote).value = student.SNote
        }

        if (noteColumn === PeriodNotesColumnPosition.ENote) {
          row.getCell(period.ENote).value = student.ENote
        }

      }
        row.commit()
    }

    // filed period by student
    // mock first period


    // 3. DETECCIÓN AUTOMÁTICA: Buscar todas las fórmulas en la hoja y limpiar el valor en caché
    workSheetExcel.eachRow({ includeEmpty: false }, (row) => {
      row.eachCell({ includeEmpty: false }, (cell) => {
      // Verifica si la celda contiene una fórmula
      if (cell.type === 6 || cell.formula || (cell.value && typeof cell.value === 'object' && 'formula' in cell.value)) {
        const formulaString = cell.formula || (cell.value as any).formula;
              // Re-asignamos la fórmula sin dejar valor en caché ("result: undefined")
            cell.value = {
              formula: formulaString,
              result: undefined
            };
        }
      });
    });
    await this.pocExcelService.saveExcelChanges(workbook, `01-${EMPTY_EXCEL_FILE_NAME}`)


    const zipFileXml = await this.pocExcelService.convertWorkbookToBuffer(workbook)

    if (zipFileXml) {
      const zipFile = zipFileXml.file('xl/workbook.xml')
      if (zipFile) {
        let infoExcel = await zipFile.async('string')

        const calcPrTag = '<calcPr calcId="0" calcMode="auto" fullCalcOnLoad="1" forceFullCalc="1"/>'
        if (infoExcel.includes('<calcPr')) {
          infoExcel = infoExcel.replace(/<calcPr[^>]*\/>|<calcPr[^>]*>[\s\S]*?<\/calcPr>/g, calcPrTag)
        } else {
          if (infoExcel.includes('</sheets>')) {
            infoExcel = infoExcel.replace('</sheets>', `</sheets>${calcPrTag}`)
          } else {
            infoExcel = infoExcel.replace('</workbook>', `${calcPrTag}</workbook>`)
          }
        }

        zipFileXml.file('xl/workbook.xml', infoExcel)

        const output = await zipFileXml.generateAsync({
          type: 'nodebuffer',
          compression: 'DEFLATE'
        })

        fs.writeFileSync(`01-${EMPTY_EXCEL_FILE_NAME}`, output)
      }
    }
  }



  async executeOld() {
    const { workbook, worksheet: workSheetExcel } = await this.pocExcelService.openExcelFile(EMPTY_EXCEL_FILE_NAME)

    if (!workSheetExcel) {
      throw new NotFoundException("File Not Found");
    }

    // students
    const studentsColumn = workSheetExcel.getColumn('A')
    const students: string[] = []
    const rowStartValue = 1


    const headerRow = workSheetExcel.getRow(1); // header columns
    const mapHeaderRow: Record<any, any> = {}

    headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
      if (colNumber > 1 && cell.value) {
        mapHeaderRow[cell.value.toString()] = workSheetExcel.getColumn(colNumber).letter // "A", "B", etc.
      }
    });

    const activitiesColumns = [
      {
        name: "Actividad"
      },
      {
        name: "Actividad 2"
      },
      {
        name: "Actividad 3"
      }
    ]

    studentsColumn.eachCell((cell, index) => {
      // jump first
      if (index > 1) {
        if (cell.value) {
          students.push(cell.value as string)
        }
      }
    })

    // por cada estudiante insertar una nota en actividad
    students.forEach((_, index) => {
      const rowPosition = rowStartValue + (index + 1)
      const row = workSheetExcel.getRow(rowPosition)
      // indicar columna
      for (const activityColum of activitiesColumns) {
        const columnLocation = mapHeaderRow[activityColum.name]
        if (columnLocation) {
          row.getCell(columnLocation).value = 10
          row.commit()
        }
      }
    })


    // 3. DETECCIÓN AUTOMÁTICA: Buscar todas las fórmulas en la hoja y limpiar el valor en caché
    workSheetExcel.eachRow({ includeEmpty: false }, (row) => {
      row.eachCell({ includeEmpty: false }, (cell) => {
      // Verifica si la celda contiene una fórmula
      if (cell.type === 6 || cell.formula || (cell.value && typeof cell.value === 'object' && 'formula' in cell.value)) {
        const formulaString = cell.formula || (cell.value as any).formula;
              // Re-asignamos la fórmula sin dejar valor en caché ("result: undefined")
            cell.value = {
              formula: formulaString,
              result: undefined
            };
        }
      });
    });
    await this.pocExcelService.saveExcelChanges(workbook, `01-${EMPTY_EXCEL_FILE_NAME}`)
    const zipFileXml = await this.pocExcelService.convertWorkbookToBuffer(workbook)

    if (zipFileXml) {
      const zipFile = zipFileXml.file('xl/workbook.xml')
      if (zipFile) {
        let infoExcel = await zipFile.async('string')

        const calcPrTag = '<calcPr calcId="0" calcMode="auto" fullCalcOnLoad="1" forceFullCalc="1"/>'
        if (infoExcel.includes('<calcPr')) {
          infoExcel = infoExcel.replace(/<calcPr[^>]*\/>|<calcPr[^>]*>[\s\S]*?<\/calcPr>/g, calcPrTag)
        } else {
          if (infoExcel.includes('</sheets>')) {
            infoExcel = infoExcel.replace('</sheets>', `</sheets>${calcPrTag}`)
          } else {
            infoExcel = infoExcel.replace('</workbook>', `${calcPrTag}</workbook>`)
          }
        }

        zipFileXml.file('xl/workbook.xml', infoExcel)

        const output = await zipFileXml.generateAsync({
          type: 'nodebuffer',
          compression: 'DEFLATE'
        })

        fs.writeFileSync('./archivo.xlsx', output)
      }
    }

    

  }
}
