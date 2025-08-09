export enum VaccinationScheduleFormScope {
    BATCH = 'BATCH',
    ANIMAL = 'ANIMAL',
}

const vaccinationTypeLabels: Record<VaccinationScheduleFormScope, string> = {
    [VaccinationScheduleFormScope.BATCH]: 'Lote - Destinada a todos os animais de um determinado lote',
    [VaccinationScheduleFormScope.ANIMAL]: 'Individual - Destinada a um animal específico',
};

export const parseFormScope = (value: string): VaccinationScheduleFormScope => {
    if (Object.values(VaccinationScheduleFormScope).includes(value as VaccinationScheduleFormScope)) return value as VaccinationScheduleFormScope;
    throw new Error(`Valor inválido para escopo do formulário: "${value}"`);
}

