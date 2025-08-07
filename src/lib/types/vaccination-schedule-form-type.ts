export enum VaccinationScheduleFormType {
    BATCH = 'BATCH',
    ANIMAL = 'ANIMAL',
}

const vaccinationTypeLabels: Record<VaccinationScheduleFormType, string> = {
    [VaccinationScheduleFormType.BATCH]: 'Lote - Destinada a todos os animais de um determinado lote',
    [VaccinationScheduleFormType.ANIMAL]: 'Individual - Destinada a um animal específico',
};