import { BadRequestException, Injectable } from "@nestjs/common";
import { ExcelService } from "../../services/excel.service.js";
import { IStudentMapped } from "../../domain/IStudentMappted.js";


@Injectable()
export class ParseStudentsToJson {
    constructor(private readonly pocExcelService: ExcelService) {}

    /**
     * Lee un Excel con las columnas `nie | name | gender` (A, B, C). La primera fila se omite si es el
     * encabezado (`NIE` en la columna A). Las filas vacías se ignoran. Todo se devuelve como texto:
     * la validación de contenido es responsabilidad de quien importa.
     */
    async execute(file: Buffer): Promise<IStudentMapped[]> {
        let worksheet
        try {
            ({ worksheet } = await this.pocExcelService.openExcelFileFromBuffer(file))
        } catch {
            throw new BadRequestException("The file is not a valid Excel (.xlsx) workbook.")
        }

        if (!worksheet) {
            throw new BadRequestException("The workbook has no worksheet.");
        }

        const studentsFormat: IStudentMapped[] = []

        worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
            const nie = row.getCell(1).text.trim()
            const name = row.getCell(2).text.trim()
            const gender = row.getCell(3).text.trim()

            if (rowNumber === 1 && /^nie$/i.test(nie)) return;
            if (!nie && !name && !gender) return;

            studentsFormat.push({ row: rowNumber, nie, name, gender })
        })

        return studentsFormat
    }

}
