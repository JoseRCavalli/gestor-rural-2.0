import {Animal} from "@/types/database.ts";

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

export const getCountAnimalsPhases = (animals: Animal[]) =>
    animals.reduce(
        (acc, a) => {
            acc.total++;
            acc[a.phase]++;
            return acc;
        },
        {
            total: 0,
            [AnimalPhase.BEZERRA]: 0,
            [AnimalPhase.NOVILHA]: 0,
            [AnimalPhase.LACTACAO]: 0,
            [AnimalPhase.VACA_SECA]: 0,
            [AnimalPhase.PRE_PARTO]: 0,
        }
    );