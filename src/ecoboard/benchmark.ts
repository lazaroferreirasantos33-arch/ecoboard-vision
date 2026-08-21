import {
    EcoBoardBoardFamily,
    getReferenceProfile,
  } from './classification-matrix';
  
  export type BenchmarkStatus =
    | 'BELOW'
    | 'INSIDE'
    | 'ABOVE'
    | 'UNKNOWN';
  
  export type BenchmarkResult = {
    family: EcoBoardBoardFamily;
    score: number;
    status: BenchmarkStatus;
    expectedMin: number | null;
    expectedMax: number | null;
    differenceFromRange: number;
    message: string;
  };
  
  export function validateEcoScoreBenchmark(
    family: EcoBoardBoardFamily,
    score: number,
  ): BenchmarkResult {
    const profile = getReferenceProfile(family);
  
    if (!profile) {
      return {
        family,
        score,
        status: 'UNKNOWN',
        expectedMin: null,
        expectedMax: null,
        differenceFromRange: 0,
        message:
          'Não existe perfil de referência para esta família de PCB.',
      };
    }
  
    const {
      min,
      max,
    } = profile.expectedScoreRange;
  
    if (score < min) {
      return {
        family,
        score,
        status: 'BELOW',
        expectedMin: min,
        expectedMax: max,
        differenceFromRange: min - score,
        message:
          `EcoScore abaixo da faixa de referência para ${profile.label}.`,
      };
    }
  
    if (score > max) {
      return {
        family,
        score,
        status: 'ABOVE',
        expectedMin: min,
        expectedMax: max,
        differenceFromRange: score - max,
        message:
          `EcoScore acima da faixa de referência para ${profile.label}.`,
      };
    }
  
    return {
      family,
      score,
      status: 'INSIDE',
      expectedMin: min,
      expectedMax: max,
      differenceFromRange: 0,
      message:
        `EcoScore dentro da faixa de referência para ${profile.label}.`,
    };
  }
  
  export function formatBenchmarkStatus(
    status: BenchmarkStatus,
  ): string {
    const labels: Record<
      BenchmarkStatus,
      string
    > = {
      BELOW: 'Abaixo da referência',
      INSIDE: 'Dentro da referência',
      ABOVE: 'Acima da referência',
      UNKNOWN: 'Sem referência',
    };
  
    return labels[status];
  }