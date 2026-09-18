import { BadRequestException, Injectable } from '@nestjs/common';
import { ExcelService } from '../../services/excel.service.js';
import {
  EMPTY_EXCEL_FILE_NAME,
  PeriodKeyByNumber,
  PeriodMapped,
  RowStartIndex,
  STUDENT_GENDER_COLUMN,
  STUDENT_NIE_COLUMN,
  STUDENT_NUMBER_COLUMN,
  STUDENT_START_COLUMN,
} from '../../domain/helpers/period-mapped.js';

export type PeriodNotesStudent = {
  nie: string;
  name: string;
  gender?: string | null;
  FNote: number | null;
  SNote: number | null;
  ENote: number | null;
};

export type FillPeriodNotesInput = {
  periodNumber: number;
  students: PeriodNotesStudent[];
  /** Archivo de un período anterior sobre el cual seguir llenando. Sin él se parte de `empty.xlsx`. */
  baseFile?: Buffer;
};

// El área de alumnos llega hasta la última fila numerada (columna A); más abajo la planilla
// tiene un bloque de estadísticas (Moda, Mediana, Promedio…) que no debe tocarse.
const MAX_ROWS_TO_SCAN = 300;

@Injectable()
export class FillPeriodNotesUseCase {
  constructor(private readonly excelService: ExcelService) {}

  async execute({ periodNumber, students, baseFile }: FillPeriodNotesInput): Promise<Buffer> {
    const periodKey = PeriodKeyByNumber[periodNumber as keyof typeof PeriodKeyByNumber];
    if (!periodKey) {
      throw new BadRequestException(`Period number ${periodNumber} is not supported by the template (1-4).`);
    }
    const noteColumns = PeriodMapped[periodKey];

    const { workbook, worksheet } = baseFile
      ? await this.excelService.openExcelFileFromBuffer(baseFile)
      : await this.excelService.openExcelFile(EMPTY_EXCEL_FILE_NAME);
    if (!worksheet) {
      throw new BadRequestException('The template has no worksheet to fill.');
    }

    let lastStudentRow = RowStartIndex - 1;
    for (let rowNumber = RowStartIndex; rowNumber < RowStartIndex + MAX_ROWS_TO_SCAN; rowNumber++) {
      if (typeof worksheet.findRow(rowNumber)?.getCell(STUDENT_NUMBER_COLUMN).value === 'number') {
        lastStudentRow = rowNumber;
      }
    }

    // Los alumnos ya presentes en el archivo base se identifican por NIE para no desalinear
    // las notas de períodos anteriores; los nuevos van a la primera fila libre.
    const rowByNie = new Map<string, number>();
    const freeRows: number[] = [];
    for (let rowNumber = RowStartIndex; rowNumber <= lastStudentRow; rowNumber++) {
      const row = worksheet.findRow(rowNumber);
      const nie = row?.getCell(STUDENT_NIE_COLUMN).text.trim() ?? '';
      const name = row?.getCell(STUDENT_START_COLUMN).text.trim() ?? '';
      if (nie) {
        rowByNie.set(nie, rowNumber);
      } else if (!name) {
        freeRows.push(rowNumber);
      }
    }

    const newStudents = students.filter((student) => !rowByNie.has(student.nie));
    if (newStudents.length > freeRows.length) {
      throw new BadRequestException(
        `The template only has room for ${rowByNie.size + freeRows.length} students; ` +
          `${rowByNie.size + newStudents.length} are needed.`,
      );
    }

    for (const student of students) {
      let rowNumber = rowByNie.get(student.nie);
      const isNewRow = rowNumber === undefined;
      if (rowNumber === undefined) {
        rowNumber = freeRows.shift()!;
      }

      const row = worksheet.getRow(rowNumber);
      row.getCell(STUDENT_START_COLUMN).value = student.name;
      if (isNewRow) {
        row.getCell(STUDENT_NIE_COLUMN).value = student.nie;
        if (row.getCell(STUDENT_NUMBER_COLUMN).value === null) {
          row.getCell(STUDENT_NUMBER_COLUMN).value = rowNumber - RowStartIndex + 1;
        }
      }
      // La plantilla trae género de ejemplo: en una fila nueva, sin dato, mejor vacío que el de otra persona.
      // En una fila existente solo se actualiza si ahora sí hay dato.
      if (student.gender || isNewRow) {
        row.getCell(STUDENT_GENDER_COLUMN).value = student.gender ?? null;
      }

      row.getCell(noteColumns.FNote).value = student.FNote;
      row.getCell(noteColumns.SNote).value = student.SNote;
      row.getCell(noteColumns.ENote).value = student.ENote;
    }

    return this.excelService.toRecalculatingBuffer(workbook, worksheet);
  }
}
