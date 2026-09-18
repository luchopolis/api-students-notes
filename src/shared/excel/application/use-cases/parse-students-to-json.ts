import { Injectable, NotFoundException } from "@nestjs/common";
import { ExcelService } from "../../services/excel.service.js";
import { IStudentMapped } from "../../domain/IStudentMappted.js";


@Injectable()
export class ParseStudentsToJson {
    constructor(private readonly pocExcelService: ExcelService) {}

    async execute(file: Buffer) {

        const { worksheet} = await this.pocExcelService.openExcelFileFromBuffer(file)
        const studentsFormat: IStudentMapped[] = []


        if (!worksheet) {
            throw new NotFoundException("File Not Found");
        }

        worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
            if (rowNumber === 1) return;

            const studentData: IStudentMapped = {
                nie: row.getCell(1).value as string,
                name: row.getCell(2).value as string,
                gender: row.getCell(3).value as string
            }

            studentsFormat.push(studentData)
        })

        return studentsFormat
    }

}