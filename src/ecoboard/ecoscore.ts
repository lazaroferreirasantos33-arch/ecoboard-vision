export type EcoScoreComponents = {
    cpu?: number;
    fpga?: number;
    asic?: number;
    bga?: number;
    memory?: number;
    goldFingers?: number;
    tantalum?: number;
    transformers?: number;
    connectors?: number;
    relays?: number;
    oscillators?: number;
  };
  
  export type EcoScoreInput = {
    components?: EcoScoreComponents;
  
    recycling?: {
      goldPotential?: string;
      silverPotential?: string;
      copperPotential?: string;
      palladiumPotential?: string;
      overallPotential?: string;
    };
  
    engineering?: {
      density?: string;
      estimatedLayers?: number;
      technology?: string;
    };
  
    physicalState?: string;
  };
  
  export type EcoScoreBreakdown = {
    electronicPotential: number;
    contactsAndInterfaces: number;
    metallurgicalPotential: number;
    pcbCharacteristics: number;
    physicalAdjustment: number;
  };
  
  export type EcoScoreResult = {
    score: number;
    grade: 'A' | 'B' | 'C' | 'D';
    classification: string;
    breakdown: EcoScoreBreakdown;
  };
  
  const clamp = (
    value: number,
    min: number,
    max: number,
  ): number => {
    return Math.min(Math.max(value, min), max);
  };
  
  function normalizeText(
    value?: string,
  ): string {
    return (value ?? '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
  
  function potentialLevel(
    value?: string,
  ): number {
    const normalized = normalizeText(value);
  
    if (
      normalized.includes('very high') ||
      normalized.includes('muito alto') ||
      normalized.includes('muito elevado')
    ) {
      return 4;
    }
  
    if (
      normalized.includes('high') ||
      normalized.includes('alto') ||
      normalized.includes('elevado')
    ) {
      return 3;
    }
  
    if (
      normalized.includes('medium') ||
      normalized.includes('medio') ||
      normalized.includes('moderado')
    ) {
      return 2;
    }
  
    if (
      normalized.includes('low') ||
      normalized.includes('baixo') ||
      normalized.includes('reduzido')
    ) {
      return 1;
    }
  
    return 0;
  }
  
  function calculateElectronicPotential(
    components: EcoScoreComponents = {},
  ): number {
    const cpu =
      clamp(components.cpu ?? 0, 0, 2) * 5;
  
    const fpga =
      clamp(components.fpga ?? 0, 0, 2) * 5;
  
    const asic =
      clamp(components.asic ?? 0, 0, 4) * 4;
  
    const bga =
      clamp(components.bga ?? 0, 0, 8) * 3;
  
    const memory =
      clamp(components.memory ?? 0, 0, 16) * 1.25;
  
    const tantalum =
      clamp(components.tantalum ?? 0, 0, 12) * 0.75;
  
    const oscillators =
      clamp(components.oscillators ?? 0, 0, 6) * 0.5;
  
    const raw =
      cpu +
      fpga +
      asic +
      bga +
      memory +
      tantalum +
      oscillators;
  
    return Math.round(
      clamp(raw, 0, 35),
    );
  }
  
  function calculateContactsAndInterfaces(
    components: EcoScoreComponents = {},
  ): number {
    const goldFingers =
      clamp(
        components.goldFingers ?? 0,
        0,
        4,
      ) * 6;
  
    const connectors =
      clamp(
        components.connectors ?? 0,
        0,
        12,
      ) * 0.75;
  
    const relays =
      clamp(
        components.relays ?? 0,
        0,
        6,
      ) * 0.25;
  
    const transformers =
      clamp(
        components.transformers ?? 0,
        0,
        6,
      ) * 0.25;
  
    const raw =
      goldFingers +
      connectors +
      relays +
      transformers;
  
    return Math.round(
      clamp(raw, 0, 20),
    );
  }
  
  function calculateMetallurgicalPotential(
    recycling: EcoScoreInput['recycling'],
  ): number {
    if (!recycling) {
      return 0;
    }
  
    const gold =
      potentialLevel(
        recycling.goldPotential,
      ) * 3;
  
    const palladium =
      potentialLevel(
        recycling.palladiumPotential,
      ) * 2.5;
  
    const silver =
      potentialLevel(
        recycling.silverPotential,
      ) * 1.5;
  
    const copper =
      potentialLevel(
        recycling.copperPotential,
      ) * 1.5;
  
    const overall =
      potentialLevel(
        recycling.overallPotential,
      ) * 1.5;
  
    const raw =
      gold +
      palladium +
      silver +
      copper +
      overall;
  
    return Math.round(
      clamp(raw, 0, 30),
    );
  }
  
  function calculatePCBCharacteristics(
    engineering: EcoScoreInput['engineering'],
  ): number {
    if (!engineering) {
      return 5;
    }
  
    let score = 0;
  
    const density =
      normalizeText(
        engineering.density,
      );
  
    if (
      density.includes('very high') ||
      density.includes('muito alta')
    ) {
      score += 8;
    } else if (
      density.includes('high') ||
      density.includes('alta')
    ) {
      score += 7;
    } else if (
      density.includes('medium') ||
      density.includes('media')
    ) {
      score += 5;
    } else if (
      density.includes('low') ||
      density.includes('baixa')
    ) {
      score += 2;
    } else {
      score += 3;
    }
  
    const layers =
      engineering.estimatedLayers ?? 0;
  
    if (layers >= 10) {
      score += 5;
    } else if (layers >= 8) {
      score += 4;
    } else if (layers >= 6) {
      score += 3;
    } else if (layers >= 4) {
      score += 2;
    } else if (layers > 0) {
      score += 1;
    }
  
    const technology =
      normalizeText(
        engineering.technology,
      );
  
    if (
      technology.includes('smd') ||
      technology.includes('bga')
    ) {
      score += 2;
    }
  
    return Math.round(
      clamp(score, 0, 15),
    );
  }
  
  function calculatePhysicalAdjustment(
    physicalState?: string,
  ): number {
    const normalized =
      normalizeText(physicalState);
  
    if (
      normalized.includes('severo') ||
      normalized.includes('severely') ||
      normalized.includes('canibalizada') ||
      normalized.includes('canibalizado') ||
      normalized.includes('componentes removidos')
    ) {
      return -5;
    }
  
    if (
      normalized.includes('ruim') ||
      normalized.includes('poor') ||
      normalized.includes('danificada') ||
      normalized.includes('danificado')
    ) {
      return -3;
    }
  
    if (
      normalized.includes('regular') ||
      normalized.includes('moderado')
    ) {
      return -1;
    }
  
    return 0;
  }
  
  function getClassification(
    score: number,
  ): Pick<
    EcoScoreResult,
    'grade' | 'classification'
  > {
    if (score >= 75) {
      return {
        grade: 'A',
        classification:
          'Alto valor de recuperação',
      };
    }
  
    if (score >= 55) {
      return {
        grade: 'B',
        classification:
          'Bom valor de recuperação',
      };
    }
  
    if (score >= 35) {
      return {
        grade: 'C',
        classification:
          'Valor intermediário de recuperação',
      };
    }
  
    return {
      grade: 'D',
      classification:
        'Baixo valor de recuperação',
    };
  }
  
  export function calculateEcoScore(
    input: EcoScoreInput,
  ): EcoScoreResult {
    const breakdown: EcoScoreBreakdown = {
      electronicPotential:
        calculateElectronicPotential(
          input.components,
        ),
  
      contactsAndInterfaces:
        calculateContactsAndInterfaces(
          input.components,
        ),
  
      metallurgicalPotential:
        calculateMetallurgicalPotential(
          input.recycling,
        ),
  
      pcbCharacteristics:
        calculatePCBCharacteristics(
          input.engineering,
        ),
  
      physicalAdjustment:
        calculatePhysicalAdjustment(
          input.physicalState,
        ),
    };
  
    const score = Math.round(
      clamp(
        breakdown.electronicPotential +
          breakdown.contactsAndInterfaces +
          breakdown.metallurgicalPotential +
          breakdown.pcbCharacteristics +
          breakdown.physicalAdjustment,
        0,
        100,
      ),
    );
  
    const classification =
      getClassification(score);
  
    return {
      score,
      ...classification,
      breakdown,
    };
  }