export enum AnimalPhase {
    LACTACAO = 'LACTACAO',
    VACA_SECA = 'VACA_SECA',
    PRE_PARTO = 'PRE_PARTO',
    NOVILHA = 'NOVILHA',
    BEZERRA = 'BEZERRA',
}

export const maskValueAnimalPhase = (phase: AnimalPhase): string => {
    return phase
        .toLowerCase()
        .replace(/_/g, ' ')
        .replace(/\b\w/g, char => char.toUpperCase());
}