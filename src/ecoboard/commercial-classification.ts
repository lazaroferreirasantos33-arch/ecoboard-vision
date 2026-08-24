export type EcoBoardCommercialFamily =
  | 'PLACA_HD'
  | 'PLACA_NOTEBOOK'
  | 'PLACA_DRIVE'
  | 'PONTEIRA'
  | 'PLACA_MAE'
  | 'INTERMEDIARIA'
  | 'PLACA_LEVE'
  | 'MODEM_COLORIDA'
  | 'NAO_CLASSIFICADA';

export type EcoBoardCommercialSubclass =
  | 'PLACA_HD'
  | 'PLACA_NOTEBOOK'
  | 'PLACA_DRIVE'
  | 'PONTEIRA_A'
  | 'PONTEIRA_B'
  | 'MAE_A'
  | 'MAE_B'
  | 'MAE_C'
  | 'MAE_D'
  | 'INTERMEDIARIA_A'
  | 'INTERMEDIARIA_C'
  | 'INTERMEDIARIA_D'
  | 'INTERMEDIARIA_D_MENOS'
  | 'PLACA_LEVE'
  | 'MODEM_COLORIDA'
  | 'SUBCLASSE_NAO_DEFINIDA'
  | 'NAO_CLASSIFICADA';

export type CommercialClassificationInput = {
  boardType?: string;
  probableName?: string;
  manufacturer?: string;
  model?: string;
  partNumber?: string;
  equipment?: string;
  application?: string;

  identificationConfidence?: number;

  engineering?: {
    density?: string;
    technology?: string;
    estimatedLayers?: number;
  };

  components?: {
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

  aiCommercialClassification?: {
    category?: string;
    confidence?: number;
    visualEvidence?: string[];
    reason?: string;
    humanReviewRequired?: boolean;
  };
};

export type CommercialClassificationResult = {
  family: EcoBoardCommercialFamily;

  subclass: EcoBoardCommercialSubclass;

  name: string;

  confidence: number;

  source:
    | 'DETERMINISTIC_RULE'
    | 'AI_CLASSIFICATION'
    | 'FAMILY_ONLY'
    | 'UNCLASSIFIED';

  humanReviewRequired: boolean;

  reason: string;

  visualEvidence: string[];
};

export function classifyCommercially(
  input: CommercialClassificationInput,
): CommercialClassificationResult {
  const deterministicResult =
    classifyByDeterministicRules(input);

  if (deterministicResult) {
    return deterministicResult;
  }

  const familyResult =
    classifyCommercialFamily(input);

  if (
    familyResult.family !== 'NAO_CLASSIFICADA'
  ) {
    const aiSubclass =
      classifySubclassFromAI(
        input,
        familyResult.family,
      );

    if (aiSubclass) {
      return aiSubclass;
    }

    return familyResult;
  }

  return createUnclassifiedResult(
    'Não há evidência suficiente para determinar a família comercial desta placa com segurança.',
  );
}

function classifyByDeterministicRules(
  input: CommercialClassificationInput,
): CommercialClassificationResult | null {
  const confidence =
    normalizeConfidence(
      input.identificationConfidence,
    );

  if (
    confidence >= 0.75 &&
    isHddControllerBoard(input)
  ) {
    return {
      family: 'PLACA_HD',
      subclass: 'PLACA_HD',
      name: 'Placa HD',
      confidence,
      source: 'DETERMINISTIC_RULE',
      humanReviewRequired: false,
      reason:
        'A identificação técnica é compatível com PCB controladora de disco rígido HDD.',
      visualEvidence:
        buildEvidenceFromFields(
          input,
          [
            'boardType',
            'probableName',
            'equipment',
            'application',
          ],
        ),
    };
  }

  if (
    confidence >= 0.75 &&
    isNotebookMotherboard(input)
  ) {
    return {
      family: 'PLACA_NOTEBOOK',
      subclass: 'PLACA_NOTEBOOK',
      name: 'Placa de Notebook',
      confidence,
      source: 'DETERMINISTIC_RULE',
      humanReviewRequired: false,
      reason:
        'A identificação técnica é compatível com motherboard de notebook.',
      visualEvidence:
        buildEvidenceFromFields(
          input,
          [
            'boardType',
            'probableName',
            'equipment',
            'application',
          ],
        ),
    };
  }

  if (
    confidence >= 0.75 &&
    isOpticalDriveBoard(input)
  ) {
    return {
      family: 'PLACA_DRIVE',
      subclass: 'PLACA_DRIVE',
      name: 'Placa de Drive',
      confidence,
      source: 'DETERMINISTIC_RULE',
      humanReviewRequired: false,
      reason:
        'A identificação técnica é compatível com placa controladora de drive óptico CD/DVD.',
      visualEvidence:
        buildEvidenceFromFields(
          input,
          [
            'boardType',
            'probableName',
            'equipment',
            'application',
          ],
        ),
    };
  }

  return null;
}

function classifyCommercialFamily(
  input: CommercialClassificationInput,
): CommercialClassificationResult {
  const confidence =
    normalizeConfidence(
      input.identificationConfidence,
    );

  const normalizedText =
    normalizeText(
      [
        input.boardType,
        input.probableName,
        input.equipment,
        input.application,
      ]
        .filter(Boolean)
        .join(' '),
    );

  if (
    isExpansionOrGraphicsBoard(
      normalizedText,
    )
  ) {
    return {
      family: 'PONTEIRA',
      subclass: 'SUBCLASSE_NAO_DEFINIDA',
      name: 'Ponteira',
      confidence,
      source: 'FAMILY_ONLY',
      humanReviewRequired: true,
      reason:
        'A placa foi identificada como placa de expansão ou placa gráfica, mas ainda não há evidência suficiente para determinar Ponteira A ou B.',
      visualEvidence:
        buildEvidenceFromFields(
          input,
          [
            'boardType',
            'probableName',
            'equipment',
          ],
        ),
    };
  }

  if (
    isDesktopMotherboard(
      normalizedText,
    )
  ) {
    return {
      family: 'PLACA_MAE',
      subclass: 'SUBCLASSE_NAO_DEFINIDA',
      name: 'Placa Mãe',
      confidence,
      source: 'FAMILY_ONLY',
      humanReviewRequired: true,
      reason:
        'A placa foi identificada como motherboard de desktop, mas ainda não há evidência suficiente para determinar Mãe A, B, C ou D com segurança.',
      visualEvidence:
        buildEvidenceFromFields(
          input,
          [
            'boardType',
            'probableName',
            'equipment',
          ],
        ),
    };
  }

  if (
    isTvDisplayMainboard(
      normalizedText,
    )
  ) {
    return {
      family: 'INTERMEDIARIA',
      subclass: 'SUBCLASSE_NAO_DEFINIDA',
      name: 'Intermediária',
      confidence,
      source: 'FAMILY_ONLY',
      humanReviewRequired: true,
      reason:
        'A placa foi identificada como placa principal de TV/display, mas ainda não há evidência suficiente para determinar a graduação comercial.',
      visualEvidence:
        buildEvidenceFromFields(
          input,
          [
            'boardType',
            'probableName',
            'equipment',
          ],
        ),
    };
  }

  if (
    isLowDensitySimpleBoard(input)
  ) {
    return {
      family: 'PLACA_LEVE',
      subclass: 'PLACA_LEVE',
      name: 'Placa Leve',
      confidence:
        Math.max(
          confidence,
          0.7,
        ),
      source: 'DETERMINISTIC_RULE',
      humanReviewRequired: false,
      reason:
        'A placa apresenta baixa densidade eletrônica e ausência ou baixa presença de componentes de maior interesse.',
      visualEvidence: [
        'Baixa densidade eletrônica observada.',
        'Poucos componentes relevantes.',
      ],
    };
  }

  if (
    isPossibleModemOrColorida(
      normalizedText,
    )
  ) {
    return {
      family: 'MODEM_COLORIDA',
      subclass: 'MODEM_COLORIDA',
      name: 'Modem / Colorida',
      confidence,
      source: 'FAMILY_ONLY',
      humanReviewRequired: true,
      reason:
        'A identificação sugere equipamento de comunicação/modem, mas a categoria ainda requer validação humana.',
      visualEvidence:
        buildEvidenceFromFields(
          input,
          [
            'boardType',
            'probableName',
            'equipment',
          ],
        ),
    };
  }

  return createUnclassifiedResult(
    'A família comercial ainda não pôde ser determinada com segurança.',
    confidence,
  );
}

function classifySubclassFromAI(
  input: CommercialClassificationInput,
  family: EcoBoardCommercialFamily,
): CommercialClassificationResult | null {
  const ai =
    input.aiCommercialClassification;

  if (!ai?.category) {
    return null;
  }

  const normalizedCategory =
    normalizeAiCategory(
      ai.category,
    );

  if (!normalizedCategory) {
    return null;
  }

  const aiConfidence =
    normalizeConfidence(
      ai.confidence,
    );

  if (aiConfidence < 0.8) {
    return null;
  }

  const subclassFamily =
    getFamilyForSubclass(
      normalizedCategory,
    );

  if (
    subclassFamily !== family
  ) {
    return null;
  }

  return {
    family,
    subclass:
      normalizedCategory,
    name:
      getSubclassName(
        normalizedCategory,
      ),
    confidence:
      aiConfidence,
    source:
      'AI_CLASSIFICATION',
    humanReviewRequired:
      ai.humanReviewRequired ??
      false,
    reason:
      ai.reason ||
      'Subclasse atribuída com base na análise visual.',
    visualEvidence:
      ai.visualEvidence ?? [],
  };
}

function isHddControllerBoard(
  input: CommercialClassificationInput,
): boolean {
  const text =
    normalizeText(
      [
        input.boardType,
        input.probableName,
        input.equipment,
        input.application,
      ]
        .filter(Boolean)
        .join(' '),
    );

  return includesAnyText(
    text,
    [
      'hdd controller board',
      'hard drive pcb',
      'hard disk pcb',
      'hard disk drive',
      'hdd',
      'disco rigido',
      'controladora de disco',
      'placa de hdd',
    ],
  );
}

function isNotebookMotherboard(
  input: CommercialClassificationInput,
): boolean {
  const text =
    normalizeText(
      [
        input.boardType,
        input.probableName,
        input.equipment,
        input.application,
      ]
        .filter(Boolean)
        .join(' '),
    );

  return includesAnyText(
    text,
    [
      'laptop motherboard',
      'notebook motherboard',
      'placa mae de notebook',
      'placa de notebook',
      'notebook',
      'laptop',
    ],
  );
}

function isOpticalDriveBoard(
  input: CommercialClassificationInput,
): boolean {
  const text =
    normalizeText(
      [
        input.boardType,
        input.probableName,
        input.equipment,
        input.application,
      ]
        .filter(Boolean)
        .join(' '),
    );

  return includesAnyText(
    text,
    [
      'optical drive',
      'cd drive',
      'dvd drive',
      'drive optico',
      'drive optical',
      'leitor de dvd',
      'leitor de cd',
      'unidade de disco optico',
    ],
  );
}

function isExpansionOrGraphicsBoard(
  text: string,
): boolean {
  return includesAnyText(
    text,
    [
      'placa de video',
      'placa grafica',
      'gpu',
      'graphics card',
      'video card',
      'pci',
      'pcie',
      'pci-e',
      'expansion card',
      'placa de expansao',
    ],
  );
}

function isDesktopMotherboard(
  text: string,
): boolean {
  return includesAnyText(
    text,
    [
      'desktop motherboard',
      'motherboard desktop',
      'placa mae desktop',
      'placa mae',
      'motherboard',
      'computador desktop',
      'computador pessoal desktop',
    ],
  );
}

function isTvDisplayMainboard(
  text: string,
): boolean {
  return includesAnyText(
    text,
    [
      'tv mainboard',
      'mainboard de tv',
      'mainboard',
      'placa principal tv',
      'placa principal de tv',
      'monitor',
      'televisor',
      'lcd',
      'led tv',
      'display board',
    ],
  );
}

function isPossibleModemOrColorida(
  text: string,
): boolean {
  return includesAnyText(
    text,
    [
      'modem',
      'router',
      'roteador',
      'communication board',
      'network board',
      'placa de comunicacao',
    ],
  );
}

function isLowDensitySimpleBoard(
  input: CommercialClassificationInput,
): boolean {
  const density =
    normalizeText(
      input.engineering?.density,
    );

  const c =
    input.components ?? {};

  const relevantCount =
    (c.cpu ?? 0) +
    (c.fpga ?? 0) +
    (c.asic ?? 0) +
    (c.bga ?? 0) +
    (c.memory ?? 0) +
    (c.goldFingers ?? 0) +
    (c.tantalum ?? 0);

  return (
    density.includes('low') &&
    relevantCount <= 1
  );
}

function normalizeAiCategory(
  value: string,
): EcoBoardCommercialSubclass | null {
  const normalized =
    value
      .trim()
      .toUpperCase();

  const aliases: Record<
    string,
    EcoBoardCommercialSubclass
  > = {
    PLACA_HD: 'PLACA_HD',
    PLACA_NOTEBOOK:
      'PLACA_NOTEBOOK',
    PLACA_DRIVE:
      'PLACA_DRIVE',

    PONTEIRA_A:
      'PONTEIRA_A',
    PONTEIRA_B:
      'PONTEIRA_B',

    MAE_A:
      'MAE_A',
    MAE_B:
      'MAE_B',
    MAE_C:
      'MAE_C',
    MAE_D:
      'MAE_D',

    INTERMEDIARIA_A:
      'INTERMEDIARIA_A',
    INTERMEDIARIA_C:
      'INTERMEDIARIA_C',
    INTERMEDIARIA_D:
      'INTERMEDIARIA_D',
    INTERMEDIARIA_D_MENOS:
      'INTERMEDIARIA_D_MENOS',

    PLACA_LEVE:
      'PLACA_LEVE',

    MODEM_COLORIDA:
      'MODEM_COLORIDA',

    NAO_CLASSIFICADA:
      'NAO_CLASSIFICADA',
  };

  return aliases[normalized] ?? null;
}

function getFamilyForSubclass(
  subclass: EcoBoardCommercialSubclass,
): EcoBoardCommercialFamily {
  switch (subclass) {
    case 'PLACA_HD':
      return 'PLACA_HD';

    case 'PLACA_NOTEBOOK':
      return 'PLACA_NOTEBOOK';

    case 'PLACA_DRIVE':
      return 'PLACA_DRIVE';

    case 'PONTEIRA_A':
    case 'PONTEIRA_B':
      return 'PONTEIRA';

    case 'MAE_A':
    case 'MAE_B':
    case 'MAE_C':
    case 'MAE_D':
      return 'PLACA_MAE';

    case 'INTERMEDIARIA_A':
    case 'INTERMEDIARIA_C':
    case 'INTERMEDIARIA_D':
    case 'INTERMEDIARIA_D_MENOS':
      return 'INTERMEDIARIA';

    case 'PLACA_LEVE':
      return 'PLACA_LEVE';

    case 'MODEM_COLORIDA':
      return 'MODEM_COLORIDA';

    default:
      return 'NAO_CLASSIFICADA';
  }
}

function getSubclassName(
  subclass: EcoBoardCommercialSubclass,
): string {
  const names: Record<
    EcoBoardCommercialSubclass,
    string
  > = {
    PLACA_HD:
      'Placa HD',

    PLACA_NOTEBOOK:
      'Placa de Notebook',

    PLACA_DRIVE:
      'Placa de Drive',

    PONTEIRA_A:
      'Ponteira A',

    PONTEIRA_B:
      'Ponteira B',

    MAE_A:
      'Placa Mãe A',

    MAE_B:
      'Placa Mãe B',

    MAE_C:
      'Placa Mãe C',

    MAE_D:
      'Placa Mãe D',

    INTERMEDIARIA_A:
      'Intermediária A',

    INTERMEDIARIA_C:
      'Intermediária C',

    INTERMEDIARIA_D:
      'Intermediária D',

    INTERMEDIARIA_D_MENOS:
      'Intermediária D Menos',

    PLACA_LEVE:
      'Placa Leve',

    MODEM_COLORIDA:
      'Modem / Colorida',

    SUBCLASSE_NAO_DEFINIDA:
      'Subclasse não definida',

    NAO_CLASSIFICADA:
      'Não classificada',
  };

  return names[subclass];
}

function createUnclassifiedResult(
  reason: string,
  confidence = 0,
  visualEvidence: string[] = [],
): CommercialClassificationResult {
  return {
    family:
      'NAO_CLASSIFICADA',
    subclass:
      'NAO_CLASSIFICADA',
    name:
      'Não classificada',
    confidence,
    source:
      'UNCLASSIFIED',
    humanReviewRequired:
      true,
    reason,
    visualEvidence,
  };
}

function buildEvidenceFromFields(
  input: CommercialClassificationInput,
  fields: Array<
    | 'boardType'
    | 'probableName'
    | 'equipment'
    | 'application'
  >,
): string[] {
  const evidence: string[] = [];

  for (const field of fields) {
    const value =
      input[field];

    if (
      typeof value === 'string' &&
      value.trim()
    ) {
      evidence.push(
        `${field}: ${value}`,
      );
    }
  }

  return evidence;
}

function includesAnyText(
  text: string,
  terms: string[],
): boolean {
  return terms.some(
    (term) =>
      text.includes(
        normalizeText(term),
      ),
  );
}

function normalizeConfidence(
  value?: number,
): number {
  if (
    value === undefined ||
    Number.isNaN(value)
  ) {
    return 0;
  }

  if (value > 1) {
    return Math.max(
      0,
      Math.min(
        1,
        value / 100,
      ),
    );
  }

  return Math.max(
    0,
    Math.min(
      1,
      value,
    ),
  );
}

function normalizeText(
  value?: string,
): string {
  return (value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(
      /[\u0300-\u036f]/g,
      '',
    );
}