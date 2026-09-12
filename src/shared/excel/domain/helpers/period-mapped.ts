export const RowStartIndex = 10 // the rows to field start at this row number


export const EMPTY_EXCEL_FILE_NAME = 'empty.xlsx'

export const STUDENT_START_COLUMN = 'C';

export enum PeriodNotesColumnPosition { 
    FNote = "FNote",
    SNote = "SNote",
    ENote = "ENote",
}

export enum FirstPeriod {
    FNote = 'E',
    SNote =  'G',
    ENote = 'I'
}

export enum SecondPeriod {
    FNote = 'E',
    SNote =  'G',
    ENote = 'I'
}

export const PeriodMapped = {
    First: {
        FNote:'E',
        SNote:'G',
        ENote:'I'
    },
    Second: SecondPeriod
}

export const FakeStudentsNotes = [
    {
        name: 'AMAYA CASTRO, JIMENA GRISBEL',
        FNote: 10,
        SNote: 10,
        ENote: 6
    },
    {
        name: 'ARAUJO ROJAS, RICARDO ALEXANDER',
        FNote: 8,
        SNote: 8,
        ENote: 8
    }
]