export const RowStartIndex = 10 // the rows to field start at this row number


export const EMPTY_EXCEL_FILE_NAME = 'empty.xlsx'

export const STUDENT_NIE_COLUMN = 'B';
export const STUDENT_START_COLUMN = 'C';
export const STUDENT_GENDER_COLUMN = 'D'

export enum PeriodNotesColumnPosition { 
    FNote = "FNote",
    SNote = "SNote",
    ENote = "ENote",
}

export const PeriodMapped = {
    First: {
        FNote:'E',
        SNote:'G',
        ENote:'I'
    },
    Second: {
        FNote:'L',
        SNote:'N',
        ENote:'P'
    }
}

export const FakeStudentsNotes = [
    {
        nie: 'aaaa',
        name: 'AMAYA CASTRO, JIMENA GRISBEL',
        FNote: 10,
        SNote: 10,
        ENote: 6,
        gender: 'F'
    },
    {
        nie: 'bbbbb',
        name: 'ARAUJO ROJAS, RICARDO ALEXANDER',
        FNote: 8,
        SNote: 8,
        ENote: 8,
        gender: 'M'
    }
]