export enum ReproductiveStatus {
    VAZIA = 'VAZIA',
    DESCARTE = 'DESCARTE',
    ABERTA = 'ABERTA',
    GESTANTE = 'GESTANTE',
    SECA = 'SECA',
    INSEMINADA = 'INSEMINADA',
}

export const maskValueReproductiveStatus = (status: ReproductiveStatus): string => {
    return status
        .toLowerCase()
        .replace(/_/g, ' ')
        .replace(/\b\w/g, char => char.toUpperCase());
};