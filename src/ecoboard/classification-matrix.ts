export type EcoBoardReferenceClass =
  | 'A'
  | 'B'
  | 'C'
  | 'D';

export type EcoBoardBoardFamily =
  | 'POWER'
  | 'TV_DISPLAY'
  | 'APPLIANCE'
  | 'GPU'
  | 'DESKTOP_MOTHERBOARD'
  | 'LAPTOP'
  | 'SERVER'
  | 'CONSUMER_NETWORKING'
  | 'TELECOM_ENTERPRISE';

export type EcoBoardReferenceProfile = {
  family: EcoBoardBoardFamily;
  label: string;

  expectedClass: EcoBoardReferenceClass;

  expectedScoreRange: {
    min: number;
    max: number;
  };

  expectedCharacteristics: {
    componentDensity:
      | 'VERY_LOW'
      | 'LOW'
      | 'MEDIUM'
      | 'HIGH'
      | 'VERY_HIGH';

    bgaPresence:
      | 'NONE'
      | 'LOW'
      | 'MEDIUM'
      | 'HIGH';

    memoryPresence:
      | 'NONE'
      | 'LOW'
      | 'MEDIUM'
      | 'HIGH';

    goldFingers:
      | 'NONE'
      | 'LOW'
      | 'MEDIUM'
      | 'HIGH';

    preciousMetalPotential:
      | 'VERY_LOW'
      | 'LOW'
      | 'MEDIUM'
      | 'HIGH'
      | 'VERY_HIGH';

    copperPotential:
      | 'LOW'
      | 'MEDIUM'
      | 'HIGH';
  };

  commercialInterpretation: string;

  notes: string[];
};

export const ECOBOARD_CLASSIFICATION_MATRIX: EcoBoardReferenceProfile[] =
  [
    {
      family: 'POWER',
      label: 'Fonte e placa de potência',
      expectedClass: 'D',
      expectedScoreRange: {
        min: 10,
        max: 30,
      },
      expectedCharacteristics: {
        componentDensity: 'LOW',
        bgaPresence: 'NONE',
        memoryPresence: 'NONE',
        goldFingers: 'NONE',
        preciousMetalPotential: 'VERY_LOW',
        copperPotential: 'HIGH',
      },
      commercialInterpretation:
        'Baixo valor relativo de recuperação eletrônica, com maior interesse em cobre e componentes de potência.',
      notes: [
        'Normalmente possui poucos circuitos integrados de alto interesse.',
        'Transformadores, bobinas e cobre podem representar parcela relevante do interesse material.',
        'Não deve receber pontuação alta apenas pela presença de grandes componentes metálicos.',
      ],
    },

    {
      family: 'TV_DISPLAY',
      label: 'TV e monitor',
      expectedClass: 'D',
      expectedScoreRange: {
        min: 20,
        max: 45,
      },
      expectedCharacteristics: {
        componentDensity: 'LOW',
        bgaPresence: 'LOW',
        memoryPresence: 'LOW',
        goldFingers: 'NONE',
        preciousMetalPotential: 'LOW',
        copperPotential: 'MEDIUM',
      },
      commercialInterpretation:
        'Baixo a intermediário valor relativo para recuperação, variando conforme a densidade da placa principal.',
      notes: [
        'Mainboards podem ter alguns ICs e memórias.',
        'Placas de fonte e inverter tendem a apresentar valor menor.',
        'Modelos mais densos podem chegar à parte superior da faixa.',
      ],
    },

    {
      family: 'APPLIANCE',
      label: 'Eletrodoméstico',
      expectedClass: 'D',
      expectedScoreRange: {
        min: 10,
        max: 30,
      },
      expectedCharacteristics: {
        componentDensity: 'LOW',
        bgaPresence: 'NONE',
        memoryPresence: 'LOW',
        goldFingers: 'NONE',
        preciousMetalPotential: 'VERY_LOW',
        copperPotential: 'MEDIUM',
      },
      commercialInterpretation:
        'Baixo valor relativo para recuperação de metais preciosos, normalmente associado a lógica simples e circuitos de controle.',
      notes: [
        'Relés, conectores e componentes de potência podem ser relevantes.',
        'A densidade de circuitos integrados costuma ser baixa.',
        'Placas de equipamentos premium podem fugir do perfil típico.',
      ],
    },

    {
      family: 'GPU',
      label: 'Placa de vídeo',
      expectedClass: 'C',
      expectedScoreRange: {
        min: 35,
        max: 60,
      },
      expectedCharacteristics: {
        componentDensity: 'MEDIUM',
        bgaPresence: 'MEDIUM',
        memoryPresence: 'HIGH',
        goldFingers: 'MEDIUM',
        preciousMetalPotential: 'MEDIUM',
        copperPotential: 'MEDIUM',
      },
      commercialInterpretation:
        'Valor intermediário de recuperação, com presença relevante de BGA, memórias e contatos dourados.',
      notes: [
        'Modelos simples ou antigos podem ficar próximos do limite inferior.',
        'GPUs robustas podem atingir Classe B.',
        'Gold Fingers devem contribuir de forma relevante sem dominar a pontuação.',
      ],
    },

    {
      family: 'DESKTOP_MOTHERBOARD',
      label: 'Motherboard desktop',
      expectedClass: 'C',
      expectedScoreRange: {
        min: 40,
        max: 65,
      },
      expectedCharacteristics: {
        componentDensity: 'MEDIUM',
        bgaPresence: 'MEDIUM',
        memoryPresence: 'MEDIUM',
        goldFingers: 'LOW',
        preciousMetalPotential: 'MEDIUM',
        copperPotential: 'MEDIUM',
      },
      commercialInterpretation:
        'Valor intermediário a bom para recuperação, dependendo da geração, densidade e presença de componentes removidos.',
      notes: [
        'Placas mais antigas podem apresentar maior interesse em determinados encapsulamentos.',
        'Placas muito canibalizadas devem sofrer penalização.',
        'Tamanho físico não deve ser confundido com valor de recuperação.',
      ],
    },

    {
      family: 'LAPTOP',
      label: 'Placa de notebook',
      expectedClass: 'B',
      expectedScoreRange: {
        min: 50,
        max: 70,
      },
      expectedCharacteristics: {
        componentDensity: 'HIGH',
        bgaPresence: 'HIGH',
        memoryPresence: 'MEDIUM',
        goldFingers: 'LOW',
        preciousMetalPotential: 'MEDIUM',
        copperPotential: 'MEDIUM',
      },
      commercialInterpretation:
        'Bom valor relativo de recuperação devido à alta densidade de componentes e múltiplos encapsulamentos BGA.',
      notes: [
        'Mesmo placas compactas podem apresentar alta densidade eletrônica.',
        'A ausência de conectores dourados extensos não deve reduzir excessivamente a nota.',
        'A densidade por área é especialmente relevante nesta família.',
      ],
    },

    {
      family: 'SERVER',
      label: 'Servidor e infraestrutura computacional',
      expectedClass: 'A',
      expectedScoreRange: {
        min: 70,
        max: 95,
      },
      expectedCharacteristics: {
        componentDensity: 'VERY_HIGH',
        bgaPresence: 'HIGH',
        memoryPresence: 'HIGH',
        goldFingers: 'HIGH',
        preciousMetalPotential: 'HIGH',
        copperPotential: 'MEDIUM',
      },
      commercialInterpretation:
        'Alto valor relativo de recuperação devido à elevada densidade eletrônica, múltiplos ICs e interfaces de alto interesse.',
      notes: [
        'Placas de servidor são referência importante para calibração das classes superiores.',
        'Backplanes simples não devem herdar automaticamente a mesma classificação.',
        'A densidade real da PCB deve prevalecer sobre o nome do equipamento.',
      ],
    },

    {
      family: 'CONSUMER_NETWORKING',
      label: 'Networking doméstico e SOHO',
      expectedClass: 'D',
      expectedScoreRange: {
        min: 25,
        max: 45,
      },
      expectedCharacteristics: {
        componentDensity: 'MEDIUM',
        bgaPresence: 'LOW',
        memoryPresence: 'LOW',
        goldFingers: 'NONE',
        preciousMetalPotential: 'LOW',
        copperPotential: 'MEDIUM',
      },
      commercialInterpretation:
        'Baixo a intermediário valor relativo de recuperação em roteadores, access points e switches domésticos.',
      notes: [
        'Equipamentos domésticos costumam ter poucos ICs de alto interesse.',
        'A presença de CPU ou memória não implica alto valor material.',
        'Deve ser separada de infraestrutura de telecom e networking enterprise.',
      ],
    },

    {
      family: 'TELECOM_ENTERPRISE',
      label: 'Telecom e networking enterprise',
      expectedClass: 'A',
      expectedScoreRange: {
        min: 65,
        max: 100,
      },
      expectedCharacteristics: {
        componentDensity: 'VERY_HIGH',
        bgaPresence: 'HIGH',
        memoryPresence: 'HIGH',
        goldFingers: 'HIGH',
        preciousMetalPotential: 'HIGH',
        copperPotential: 'MEDIUM',
      },
      commercialInterpretation:
        'Alto valor relativo de recuperação em placas densas de telecom, switches enterprise e infraestrutura de rede.',
      notes: [
        'Pode conter múltiplos ASICs, FPGAs, memórias e interfaces douradas.',
        'Line cards e placas de telecom antigas podem apresentar interesse elevado.',
        'Não deve incluir roteadores e switches domésticos simples.',
      ],
    },
  ];

export function getReferenceProfile(
  family: EcoBoardBoardFamily,
): EcoBoardReferenceProfile | undefined {
  return ECOBOARD_CLASSIFICATION_MATRIX.find(
    (profile) => profile.family === family,
  );
}

export function isScoreInsideExpectedRange(
  family: EcoBoardBoardFamily,
  score: number,
): boolean {
  const profile = getReferenceProfile(family);

  if (!profile) {
    return false;
  }

  return (
    score >= profile.expectedScoreRange.min &&
    score <= profile.expectedScoreRange.max
  );
}