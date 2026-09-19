export interface IStudentMapped {
    /** Número de fila en el Excel (1-based), para poder señalar errores. */
    row: number;
    nie: string;
    name: string;
    gender: string;
}
