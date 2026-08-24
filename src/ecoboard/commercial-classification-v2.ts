export type EcoBoardOperationalFamily =
  | 'PROCESSOR'
  | 'MEMORY_MODULE'
  | 'HDD_BOARD'
  | 'OPTICAL_DRIVE_BOARD'
  | 'TABLET_BOARD'
  | 'NOTEBOOK_BOARD'
  | 'COMPACT_COMPUTER_BOARD'
  | 'GPU_BOARD'
  | 'CONSOLE_BOARD'
  | 'SERVER_BOARD'
  | 'MODEM_SET_TOP'
  | 'DISPLAY_CONTROL'
  | 'TV_MAINBOARD'
  | 'DESKTOP_MOTHERBOARD'
  | 'GENERIC_ELECTRONIC'
  | 'LOW_DENSITY_BOARD'
  | 'UNKNOWN';

export type EcoBoardCommercialCategory =
  | 'PROCESSADOR_FERRO'
  | 'PROCESSADOR_PLASTICO'
  | 'PROCESSADOR_CERAMICO'
  | 'PROCESSADOR_SLOT'

  | 'MEMORIA_DOURADA'
  | 'MEMORIA_PRATA'

  | 'PLACA_HD'
  | 'PLACA_DRIVE'
  | 'PLACA_TABLET'

  | 'NOTEBOOK_A'
  | 'NOTEBOOK_B'
  | 'NOTEBOOK_C'
  | 'PLACA_NOTEBOOK'

  | 'PONTEIRA_A'
  | 'PONTEIRA_B'
  | 'PONTEIRA'

  | 'MAE_A'
  | 'MAE_B'
  | 'MAE_C'
  | 'MAE_D'
  | 'PLACA_MAE'

  | 'INTERMEDIARIA_A'
  | 'INTERMEDIARIA_C'
  | 'INTERMEDIARIA_D'
  | 'INTERMEDIARIA_D_MENOS'
  | 'INTERMEDIARIA'

  | 'ELETRONICA_A'
  | 'ELETRONICA_B'
  | 'ELETRONICA_C'
  | 'ELETRONICA_D'
  | 'ELETRONICA_D_MENOS'
  | 'ELETRONICA_E'
  | 'ELETRONICA'

  | 'PLACA_LEVE'
  | 'MISTA_LEVE'

  | 'MODEM'
  | 'MODEM_COLORIDA'

  | 'SERVIDOR_A'
  | 'SERVIDOR_B'
  | 'SERVIDOR'

  | 'SUBCLASSE_NAO_DEFINIDA'
  | 'NAO_CLASSIFICADA';

export type ClassificationSource =
  | 'DETERMINISTIC'
  | 'AI_SUPPORTED'
  | 'FAMILY_ONLY'
  | 'UNCLASSIFIED';

export type CommercialClassificationV2Input = {
  boardType?: string;
  probableName?: string;
  manufacturer?: string;
  model?: string;
  partNumber?: string;
  equipment?: string;
  application?: string;

  identificationConfidence?: number;

  engineering?: {
    technology?: string;
    estimatedLayers?: number;
    density?: string;
    condition?: string;
    integrity?: number;
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

export type CommercialClassificationV2Result = {
  family: EcoBoardOperationalFamily;

  category: EcoBoardCommercialCategory;

  name: string;

  technicalConfidence: number;

  commercialConfidence: number;

  source: ClassificationSource;

  humanReviewRequired: boolean;

  reason: string;

  evidence: string[];
};

export function classifyCommerciallyV2(
  input: CommercialClassificationV2Input,
): CommercialClassificationV2Result {
  const normalized = buildNormalizedInput(input);

  /*
   * REGRA CENTRAL:
   *
   * Primeiro identificar o objeto/família operacional.
   * Depois aplicar categoria comercial.
   *
   * Regras específicas sempre executam antes
   * das famílias genéricas.
   */

  const processor =
    classifyProcessor(input, normalized);

  if (processor) {
    return processor;
  }

  const memory =
    classifyMemory(input, normalized);

  if (memory) {
    return memory;
  }

  const hdd =
    classifyHdd(input, normalized);

  if (hdd) {
    return hdd;
  }

  const drive =
    classifyOpticalDrive(
      input,
      normalized,
    );

  if (drive) {
    return drive;
  }

  const tablet =
    classifyTablet(input, normalized);

  if (tablet) {
    return tablet;
  }

  const notebook =
    classifyNotebook(input, normalized);

  if (notebook) {
    return notebook;
  }

  const compactComputer =
    classifyCompactComputer(
      input,
      normalized,
    );

  if (compactComputer) {
    return compactComputer;
  }

  const gpu =
    classifyGpu(input, normalized);

  if (gpu) {
    return gpu;
  }

  const consoleBoard =
    classifyConsole(input, normalized);

  if (consoleBoard) {
    return consoleBoard;
  }

  const server =
    classifyServer(input, normalized);

  if (server) {
    return server;
  }

  const modem =
    classifyModemSetTop(
      input,
      normalized,
    );

  if (modem) {
    return modem;
  }

  const display =
    classifyDisplayControl(
      input,
      normalized,
    );

  if (display) {
    return display;
  }

  const tvMainboard =
    classifyTvMainboard(
      input,
      normalized,
    );

  if (tvMainboard) {
    return tvMainboard;
  }

  const desktop =
    classifyDesktopMotherboard(
      input,
      normalized,
    );

  if (desktop) {
    return desktop;
  }

  const generic =
    classifyGenericElectronic(
      input,
      normalized,
    );

  if (generic) {
    return generic;
  }

  return createUnclassified(
    input,
    'A EcoBoard ainda não possui evidência suficiente para determinar a categoria comercial desta placa com segurança.',
  );
}

/* =========================================================
   PROCESSADORES
   ========================================================= */

function classifyProcessor(
  input: CommercialClassificationV2Input,
  normalized: NormalizedInput,
): CommercialClassificationV2Result | null {
  if (
    !includesAny(
      normalized.text,
      [
        'processor',
        'processador',
        'cpu processor',
        'cpu bga',
      ],
    )
  ) {
    return null;
  }

  /*
   * Temos ground truth:
   *
   * CPU Intel com encapsulamento metálico/LGA
   * → PROCESSADOR_FERRO
   *
   * CPU BGA
   * → PROCESSADOR_PLASTICO
   *
   * Ainda NÃO temos evidência suficiente
   * para graduação A/B/C.
   */

  if (
    includesAny(
      normalized.text,
      [
        'cpu bga',
        'bga processor',
        'processador bga',
      ],
    )
  ) {
    return createResult({
      input,
      family: 'PROCESSOR',
      category: 'PROCESSADOR_PLASTICO',
      name: 'Processador Plástico',
      commercialConfidence: 0.82,
      source: 'DETERMINISTIC',
      humanReviewRequired: false,
      reason:
        'A identificação técnica indica processador em encapsulamento BGA, compatível com a classe comercial Processador Plástico observada no benchmark.',
      evidence: [
        'Objeto identificado como processador.',
        'Encapsulamento identificado como BGA.',
      ],
    });
  }

  if (
    includesAny(
      normalized.text,
      [
        'intel cpu processor',
        'cpu processor',
        'intel processor',
      ],
    )
  ) {
    return createResult({
      input,
      family: 'PROCESSOR',
      category: 'PROCESSADOR_FERRO',
      name: 'Processador Ferro',
      commercialConfidence: 0.78,
      source: 'DETERMINISTIC',
      humanReviewRequired: true,
      reason:
        'A identificação é compatível com processador do padrão físico associado ao exemplo validado como Processador Ferro. A classificação ainda requer expansão do dataset.',
      evidence: [
        'Objeto identificado como processador.',
        input.manufacturer
          ? `Fabricante identificado: ${input.manufacturer}.`
          : 'Fabricante não identificado.',
      ],
    });
  }

  return createResult({
    input,
    family: 'PROCESSOR',
    category: 'SUBCLASSE_NAO_DEFINIDA',
    name: 'Processador',
    commercialConfidence: 0.65,
    source: 'FAMILY_ONLY',
    humanReviewRequired: true,
    reason:
      'O item foi identificado como processador, mas a EcoBoard ainda não possui evidência suficiente para definir Ferro, Plástico, Cerâmico ou Slot.',
    evidence: [
      'Objeto identificado como processador.',
    ],
  });
}

/* =========================================================
   MEMÓRIAS
   ========================================================= */

function classifyMemory(
  input: CommercialClassificationV2Input,
  normalized: NormalizedInput,
): CommercialClassificationV2Result | null {
  const memoryModuleDetected =
    includesAny(
      normalized.text,
      [
        'memory module',
        'ram stick',
        'memoria ram',
        'memory ram',
        'edo dimm',
        'dimm',
      ],
    );

  if (!memoryModuleDetected) {
    return null;
  }

  /*
   * Temos dois ground truths:
   *
   * RAM Stick → MEMORIA_DOURADA
   * EDO DIMM → MEMORIA_PRATA
   *
   * Ainda não há regra visual robusta para
   * generalizar Dourada x Prata.
   */

  if (
    includesAny(
      normalized.text,
      [
        'edo dimm',
        'edo memory',
      ],
    )
  ) {
    return createResult({
      input,
      family: 'MEMORY_MODULE',
      category: 'MEMORIA_PRATA',
      name: 'Memória Prata',
      commercialConfidence: 0.8,
      source: 'DETERMINISTIC',
      humanReviewRequired: false,
      reason:
        'O módulo foi identificado como memória EDO DIMM, compatível com o exemplo comercial validado como Memória Prata.',
      evidence: [
        'Módulo de memória identificado.',
        'Arquitetura EDO DIMM identificada.',
      ],
    });
  }

  return createResult({
    input,
    family: 'MEMORY_MODULE',
    category: 'SUBCLASSE_NAO_DEFINIDA',
    name: 'Memória',
    commercialConfidence: 0.7,
    source: 'FAMILY_ONLY',
    humanReviewRequired: true,
    reason:
      'O objeto foi identificado como módulo de memória, mas a distinção Dourada x Prata ainda não possui evidência suficiente para automação geral.',
    evidence: [
      'Módulo RAM identificado.',
      `${input.components?.memory ?? 0} circuitos de memória detectados.`,
      `${input.components?.goldFingers ?? 0} conjunto(s) de contatos de borda detectado(s).`,
    ],
  });
}

/* =========================================================
   HDD
   ========================================================= */

function classifyHdd(
  input: CommercialClassificationV2Input,
  normalized: NormalizedInput,
): CommercialClassificationV2Result | null {
  if (
    !includesAny(
      normalized.text,
      [
        'hdd controller board',
        'hard drive pcb',
        'hard disk pcb',
        'hard disk drive',
        'disco rigido',
        'placa de hdd',
        'controladora de hd',
        'controladora de disco rigido',
      ],
    )
  ) {
    return null;
  }

  return createResult({
    input,
    family: 'HDD_BOARD',
    category: 'PLACA_HD',
    name: 'Placa HD',
    commercialConfidence:
      Math.max(
        normalized.technicalConfidence,
        0.92,
      ),
    source: 'DETERMINISTIC',
    humanReviewRequired: false,
    reason:
      'A identificação técnica é compatível com PCB controladora de disco rígido HDD.',
    evidence:
      buildTechnicalEvidence(input),
  });
}

/* =========================================================
   DRIVE CD/DVD
   ========================================================= */

function classifyOpticalDrive(
  input: CommercialClassificationV2Input,
  normalized: NormalizedInput,
): CommercialClassificationV2Result | null {
  if (
    !includesAny(
      normalized.text,
      [
        'optical drive',
        'drive optico',
        'unidade optica',
        'dvd drive',
        'cd drive',
        'leitor de dvd',
        'leitor de cd',
        'cd/dvd',
      ],
    )
  ) {
    return null;
  }

  return createResult({
    input,
    family: 'OPTICAL_DRIVE_BOARD',
    category: 'PLACA_DRIVE',
    name: 'Placa de Drive',
    commercialConfidence:
      Math.max(
        normalized.technicalConfidence,
        0.88,
      ),
    source: 'DETERMINISTIC',
    humanReviewRequired: false,
    reason:
      'A identificação técnica é compatível com PCB controladora de unidade óptica CD/DVD.',
    evidence:
      buildTechnicalEvidence(input),
  });
}

/* =========================================================
   TABLET
   ========================================================= */

function classifyTablet(
  input: CommercialClassificationV2Input,
  normalized: NormalizedInput,
): CommercialClassificationV2Result | null {
  if (
    !includesAny(
      normalized.text,
      [
        'tablet motherboard',
        'placa mae de tablet',
        'placa de tablet',
        'tablet board',
        'tablet',
      ],
    )
  ) {
    return null;
  }

  return createResult({
    input,
    family: 'TABLET_BOARD',
    category: 'PLACA_TABLET',
    name: 'Placa Tablet',
    commercialConfidence:
      Math.max(
        normalized.technicalConfidence,
        0.86,
      ),
    source: 'DETERMINISTIC',
    humanReviewRequired: false,
    reason:
      'A origem do equipamento foi identificada como tablet, portanto a placa pertence à família comercial Placa Tablet e não à família genérica de placas-mãe.',
    evidence:
      buildTechnicalEvidence(input),
  });
}

/* =========================================================
   NOTEBOOK
   ========================================================= */

function classifyNotebook(
  input: CommercialClassificationV2Input,
  normalized: NormalizedInput,
): CommercialClassificationV2Result | null {
  if (
    !includesAny(
      normalized.text,
      [
        'laptop motherboard',
        'notebook motherboard',
        'placa mae de notebook',
        'placa de notebook',
        'laptop',
        'notebook',
      ],
    )
  ) {
    return null;
  }

  /*
   * A família Notebook está validada.
   * Ainda não podemos inferir A/B/C de forma geral.
   */

  return createResult({
    input,
    family: 'NOTEBOOK_BOARD',
    category: 'PLACA_NOTEBOOK',
    name: 'Placa de Notebook',
    commercialConfidence:
      Math.max(
        normalized.technicalConfidence,
        0.85,
      ),
    source: 'DETERMINISTIC',
    humanReviewRequired: true,
    reason:
      'A placa foi identificada como motherboard de notebook. A graduação Notebook A/B/C ainda requer maior base de referência.',
    evidence:
      buildTechnicalEvidence(input),
  });
}

/* =========================================================
   ALL-IN-ONE / COMPUTADOR COMPACTO
   ========================================================= */

function classifyCompactComputer(
  input: CommercialClassificationV2Input,
  normalized: NormalizedInput,
): CommercialClassificationV2Result | null {
  if (
    !includesAny(
      normalized.text,
      [
        'all-in-one',
        'all in one',
        'aio motherboard',
        'aio pc',
      ],
    )
  ) {
    return null;
  }

  /*
   * Ground truth disponível:
   *
   * All-in-One testado → NOTEBOOK_C
   *
   * Mantemos revisão humana porque ainda é
   * um único exemplar validado.
   */

  return createResult({
    input,
    family: 'COMPACT_COMPUTER_BOARD',
    category: 'NOTEBOOK_C',
    name: 'Notebook C',
    commercialConfidence: 0.76,
    source: 'DETERMINISTIC',
    humanReviewRequired: true,
    reason:
      'Motherboard All-in-One compatível com o exemplar comercial validado como Notebook C. A regra ainda requer mais exemplos para generalização.',
    evidence:
      buildTechnicalEvidence(input),
  });
}

/* =========================================================
   GPU / PONTEIRA
   ========================================================= */

function classifyGpu(
  input: CommercialClassificationV2Input,
  normalized: NormalizedInput,
): CommercialClassificationV2Result | null {
  if (
    !includesAny(
      normalized.text,
      [
        'graphics card',
        'video card',
        'placa grafica',
        'placa de video',
        'gpu',
        'geforce',
        'radeon',
      ],
    )
  ) {
    return null;
  }

  const aiCategory =
    normalizeAiCategory(
      input.aiCommercialClassification
        ?.category,
    );

  const aiConfidence =
    normalizeConfidence(
      input.aiCommercialClassification
        ?.confidence,
    );

  if (
    (
      aiCategory === 'PONTEIRA_A' ||
      aiCategory === 'PONTEIRA_B'
    ) &&
    aiConfidence >= 0.85
  ) {
    return createResult({
      input,
      family: 'GPU_BOARD',
      category: aiCategory,
      name:
        aiCategory === 'PONTEIRA_A'
          ? 'Ponteira A'
          : 'Ponteira B',
      commercialConfidence:
        aiConfidence,
      source: 'AI_SUPPORTED',
      humanReviewRequired: false,
      reason:
        input.aiCommercialClassification
          ?.reason ||
        'Placa gráfica classificada dentro da família Ponteira.',
      evidence:
        input.aiCommercialClassification
          ?.visualEvidence ??
        buildTechnicalEvidence(input),
    });
  }

  return createResult({
    input,
    family: 'GPU_BOARD',
    category: 'PONTEIRA',
    name: 'Ponteira',
    commercialConfidence: 0.72,
    source: 'FAMILY_ONLY',
    humanReviewRequired: true,
    reason:
      'A placa foi identificada como GPU/placa de expansão, mas a EcoBoard ainda não possui evidência robusta suficiente para determinar Ponteira A ou B.',
    evidence:
      buildTechnicalEvidence(input),
  });
}

/* =========================================================
   CONSOLE
   ========================================================= */

function classifyConsole(
  input: CommercialClassificationV2Input,
  normalized: NormalizedInput,
): CommercialClassificationV2Result | null {
  if (
    !includesAny(
      normalized.text,
      [
        'playstation',
        'xbox',
        'console motherboard',
        'placa mae de console',
        'console de videogame',
        'video game console',
        'videogame',
      ],
    )
  ) {
    return null;
  }

  /*
   * Ground truth:
   * PlayStation 2 → ELETRONICA_A
   */

  if (
    includesAny(
      normalized.text,
      [
        'playstation 2',
        'ps2',
      ],
    )
  ) {
    return createResult({
      input,
      family: 'CONSOLE_BOARD',
      category: 'ELETRONICA_A',
      name: 'Eletrônica A',
      commercialConfidence: 0.82,
      source: 'DETERMINISTIC',
      humanReviewRequired: false,
      reason:
        'Motherboard de PlayStation 2 compatível com o exemplar validado comercialmente como Eletrônica A.',
      evidence:
        buildTechnicalEvidence(input),
    });
  }

  return createResult({
    input,
    family: 'CONSOLE_BOARD',
    category: 'ELETRONICA',
    name: 'Placa Eletrônica',
    commercialConfidence: 0.65,
    source: 'FAMILY_ONLY',
    humanReviewRequired: true,
    reason:
      'A placa pertence a um console, mas ainda não há evidência suficiente para determinar a graduação Eletrônica A/B/C/D/E.',
    evidence:
      buildTechnicalEvidence(input),
  });
}

/* =========================================================
   SERVIDOR
   ========================================================= */

function classifyServer(
  input: CommercialClassificationV2Input,
  normalized: NormalizedInput,
): CommercialClassificationV2Result | null {
  if (
    !includesAny(
      normalized.text,
      [
        'server motherboard',
        'server board',
        'servidor',
        'server',
      ],
    )
  ) {
    return null;
  }

  return createResult({
    input,
    family: 'SERVER_BOARD',
    category: 'SERVIDOR',
    name: 'Servidor',
    commercialConfidence: 0.75,
    source: 'FAMILY_ONLY',
    humanReviewRequired: true,
    reason:
      'A placa foi identificada como placa de servidor, mas a graduação Servidor A/B ainda requer referências adicionais.',
    evidence:
      buildTechnicalEvidence(input),
  });
}

/* =========================================================
   MODEM / SET-TOP BOX
   ========================================================= */

function classifyModemSetTop(
  input: CommercialClassificationV2Input,
  normalized: NormalizedInput,
): CommercialClassificationV2Result | null {
  if (
    !includesAny(
      normalized.text,
      [
        'modem',
        'set-top box',
        'set top box',
        'receptor de tv',
        'receptor de tv a cabo',
        'receptor de satelite',
        'receptor de satélite',
      ],
    )
  ) {
    return null;
  }

  /*
   * Ground truth:
   * set-top box/receptor testado → MODEM_COLORIDA
   */

  if (
    includesAny(
      normalized.text,
      [
        'set-top box',
        'set top box',
        'receptor de tv',
        'receptor de satelite',
        'receptor de satélite',
      ],
    )
  ) {
    return createResult({
      input,
      family: 'MODEM_SET_TOP',
      category: 'MODEM_COLORIDA',
      name: 'Modem Colorida',
      commercialConfidence: 0.8,
      source: 'DETERMINISTIC',
      humanReviewRequired: false,
      reason:
        'Placa de receptor/set-top box compatível com o exemplar comercial validado como Modem Colorida.',
      evidence:
        buildTechnicalEvidence(input),
    });
  }

  return createResult({
    input,
    family: 'MODEM_SET_TOP',
    category: 'MODEM',
    name: 'Modem',
    commercialConfidence: 0.72,
    source: 'FAMILY_ONLY',
    humanReviewRequired: true,
    reason:
      'A placa foi identificada como equipamento de comunicação/modem, mas ainda há necessidade de validar a distinção Modem x Modem Colorida.',
    evidence:
      buildTechnicalEvidence(input),
  });
}

/* =========================================================
   DISPLAY / T-CON
   ========================================================= */

function classifyDisplayControl(
  input: CommercialClassificationV2Input,
  normalized: NormalizedInput,
): CommercialClassificationV2Result | null {
  const displayDetected =
    includesAny(
      normalized.text,
      [
        't-con',
        'tcon',
        'display timing controller',
        'display driver',
        'barra de driver',
        'driver de matriz',
      ],
    );

  if (!displayDetected) {
    return null;
  }

  /*
   * Temos dois ground truths diferentes:
   *
   * barra T-Con simples → PLACA_LEVE
   * LG Display T-Con → MISTA_LEVE
   *
   * Portanto não generalizamos T-Con diretamente.
   */

  const density =
    normalizeText(
      input.engineering?.density,
    );

  const relevant =
    countRelevantComponents(input);

  if (
    density.includes('low') &&
    relevant <= 1
  ) {
    return createResult({
      input,
      family: 'DISPLAY_CONTROL',
      category: 'PLACA_LEVE',
      name: 'Placa Leve',
      commercialConfidence: 0.74,
      source: 'DETERMINISTIC',
      humanReviewRequired: true,
      reason:
        'A placa de display apresenta baixa densidade e pouquíssimos componentes relevantes, compatível com o padrão observado de Placa Leve.',
      evidence: [
        'Placa de display/T-Con identificada.',
        'Baixa densidade eletrônica.',
        `${relevant} componente(s) relevante(s) contabilizado(s).`,
      ],
    });
  }

  return createResult({
    input,
    family: 'DISPLAY_CONTROL',
    category: 'MISTA_LEVE',
    name: 'Mista Leve',
    commercialConfidence: 0.68,
    source: 'FAMILY_ONLY',
    humanReviewRequired: true,
    reason:
      'A placa pertence à família de controle/display. O padrão é compatível com Mista Leve, porém ainda são necessários mais exemplos para separar Mista Leve, Placa Leve e Intermediária com segurança.',
    evidence:
      buildTechnicalEvidence(input),
  });
}

/* =========================================================
   MAINBOARD TV
   ========================================================= */

function classifyTvMainboard(
  input: CommercialClassificationV2Input,
  normalized: NormalizedInput,
): CommercialClassificationV2Result | null {
  if (
    !includesAny(
      normalized.text,
      [
        'tv mainboard',
        'mainboard de tv',
        'placa principal tv',
        'placa principal de tv',
        'televisor',
        'tv lcd',
        'tv led',
      ],
    )
  ) {
    return null;
  }

  const aiCategory =
    normalizeAiCategory(
      input.aiCommercialClassification
        ?.category,
    );

  const aiConfidence =
    normalizeConfidence(
      input.aiCommercialClassification
        ?.confidence,
    );

  if (
    isIntermediateCategory(
      aiCategory,
    ) &&
    aiConfidence >= 0.85
  ) {
    return createResult({
      input,
      family: 'TV_MAINBOARD',
      category: aiCategory!,
      name:
        getCategoryName(aiCategory!),
      commercialConfidence:
        aiConfidence,
      source: 'AI_SUPPORTED',
      humanReviewRequired:
        input
          .aiCommercialClassification
          ?.humanReviewRequired ??
        false,
      reason:
        input
          .aiCommercialClassification
          ?.reason ||
        'Mainboard de TV classificada dentro da família Intermediária.',
      evidence:
        input
          .aiCommercialClassification
          ?.visualEvidence ??
        buildTechnicalEvidence(input),
    });
  }

  return createResult({
    input,
    family: 'TV_MAINBOARD',
    category: 'INTERMEDIARIA',
    name: 'Intermediária',
    commercialConfidence: 0.7,
    source: 'FAMILY_ONLY',
    humanReviewRequired: true,
    reason:
      'A placa foi identificada como mainboard de TV/monitor, mas ainda não há evidência suficiente para determinar Intermediária A/C/D/D Menos.',
    evidence:
      buildTechnicalEvidence(input),
  });
}

/* =========================================================
   DESKTOP MOTHERBOARD
   ========================================================= */

function classifyDesktopMotherboard(
  input: CommercialClassificationV2Input,
  normalized: NormalizedInput,
): CommercialClassificationV2Result | null {
  if (
    !includesAny(
      normalized.text,
      [
        'desktop motherboard',
        'motherboard desktop',
        'placa mae desktop',
        'computador desktop',
        'motherboard',
      ],
    )
  ) {
    return null;
  }

  /*
   * Importante:
   * esta regra vem DEPOIS de Notebook,
   * All-in-One, Tablet, Console etc.
   */

  const aiCategory =
    normalizeAiCategory(
      input.aiCommercialClassification
        ?.category,
    );

  const aiConfidence =
    normalizeConfidence(
      input.aiCommercialClassification
        ?.confidence,
    );

  if (
    isMotherboardCategory(
      aiCategory,
    ) &&
    aiConfidence >= 0.9
  ) {
    return createResult({
      input,
      family: 'DESKTOP_MOTHERBOARD',
      category: aiCategory!,
      name:
        getCategoryName(aiCategory!),
      commercialConfidence:
        aiConfidence,
      source: 'AI_SUPPORTED',
      humanReviewRequired:
        input
          .aiCommercialClassification
          ?.humanReviewRequired ??
        false,
      reason:
        input
          .aiCommercialClassification
          ?.reason ||
        'Motherboard desktop classificada dentro da família Mãe.',
      evidence:
        input
          .aiCommercialClassification
          ?.visualEvidence ??
        buildTechnicalEvidence(input),
    });
  }

  return createResult({
    input,
    family: 'DESKTOP_MOTHERBOARD',
    category: 'PLACA_MAE',
    name: 'Placa Mãe',
    commercialConfidence: 0.72,
    source: 'FAMILY_ONLY',
    humanReviewRequired: true,
    reason:
      'A placa foi identificada como motherboard de desktop, mas a EcoBoard ainda não possui base suficiente para determinar Mãe A/B/C/D com segurança.',
    evidence:
      buildTechnicalEvidence(input),
  });
}

/* =========================================================
   ELETRÔNICA GENÉRICA
   ========================================================= */

function classifyGenericElectronic(
  input: CommercialClassificationV2Input,
  normalized: NormalizedInput,
): CommercialClassificationV2Result | null {
  const density =
    normalizeText(
      input.engineering?.density,
    );

  const relevant =
    countRelevantComponents(input);

  if (
    density.includes('low') &&
    relevant <= 1
  ) {
    return createResult({
      input,
      family: 'LOW_DENSITY_BOARD',
      category: 'PLACA_LEVE',
      name: 'Placa Leve',
      commercialConfidence: 0.7,
      source: 'DETERMINISTIC',
      humanReviewRequired: true,
      reason:
        'PCB de baixa densidade e com poucos componentes relevantes, compatível com a família comercial Placa Leve.',
      evidence: [
        'Baixa densidade eletrônica.',
        `${relevant} componente(s) relevante(s) detectado(s).`,
      ],
    });
  }

  if (
    includesAny(
      normalized.text,
      [
        'placa de controle',
        'control board',
        'controller board',
        'placa eletronica',
        'placa eletrônica',
      ],
    )
  ) {
    return createResult({
      input,
      family: 'GENERIC_ELECTRONIC',
      category: 'ELETRONICA',
      name: 'Placa Eletrônica',
      commercialConfidence: 0.55,
      source: 'FAMILY_ONLY',
      humanReviewRequired: true,
      reason:
        'A PCB foi reconhecida como placa eletrônica genérica, porém ainda não há evidência suficiente para determinar graduação A/B/C/D/E.',
      evidence:
        buildTechnicalEvidence(input),
    });
  }

  return null;
}

/* =========================================================
   HELPERS
   ========================================================= */

type NormalizedInput = {
  text: string;
  technicalConfidence: number;
};

function buildNormalizedInput(
  input: CommercialClassificationV2Input,
): NormalizedInput {
  return {
    text: normalizeText(
      [
        input.boardType,
        input.probableName,
        input.manufacturer,
        input.model,
        input.partNumber,
        input.equipment,
        input.application,
      ]
        .filter(Boolean)
        .join(' '),
    ),

    technicalConfidence:
      normalizeConfidence(
        input.identificationConfidence,
      ),
  };
}

function countRelevantComponents(
  input: CommercialClassificationV2Input,
): number {
  const c =
    input.components ?? {};

  return (
    (c.cpu ?? 0) +
    (c.fpga ?? 0) +
    (c.asic ?? 0) +
    (c.bga ?? 0) +
    (c.memory ?? 0) +
    (c.goldFingers ?? 0) +
    (c.tantalum ?? 0)
  );
}

function normalizeAiCategory(
  value?: string,
): EcoBoardCommercialCategory | null {
  if (!value) {
    return null;
  }

  const normalized =
    value.trim().toUpperCase();

  const allowed: EcoBoardCommercialCategory[] =
    [
      'PONTEIRA_A',
      'PONTEIRA_B',

      'MAE_A',
      'MAE_B',
      'MAE_C',
      'MAE_D',

      'INTERMEDIARIA_A',
      'INTERMEDIARIA_C',
      'INTERMEDIARIA_D',
      'INTERMEDIARIA_D_MENOS',

      'PLACA_HD',
    ];

  return allowed.includes(
    normalized as EcoBoardCommercialCategory,
  )
    ? (normalized as EcoBoardCommercialCategory)
    : null;
}

function isMotherboardCategory(
  category: EcoBoardCommercialCategory | null,
): boolean {
  return (
    category === 'MAE_A' ||
    category === 'MAE_B' ||
    category === 'MAE_C' ||
    category === 'MAE_D'
  );
}

function isIntermediateCategory(
  category: EcoBoardCommercialCategory | null,
): boolean {
  return (
    category === 'INTERMEDIARIA_A' ||
    category === 'INTERMEDIARIA_C' ||
    category === 'INTERMEDIARIA_D' ||
    category ===
      'INTERMEDIARIA_D_MENOS'
  );
}

function getCategoryName(
  category: EcoBoardCommercialCategory,
): string {
  const names: Record<
    EcoBoardCommercialCategory,
    string
  > = {
    PROCESSADOR_FERRO:
      'Processador Ferro',

    PROCESSADOR_PLASTICO:
      'Processador Plástico',

    PROCESSADOR_CERAMICO:
      'Processador Cerâmico',

    PROCESSADOR_SLOT:
      'Processador Slot',

    MEMORIA_DOURADA:
      'Memória Dourada',

    MEMORIA_PRATA:
      'Memória Prata',

    PLACA_HD:
      'Placa HD',

    PLACA_DRIVE:
      'Placa de Drive',

    PLACA_TABLET:
      'Placa Tablet',

    NOTEBOOK_A:
      'Notebook A',

    NOTEBOOK_B:
      'Notebook B',

    NOTEBOOK_C:
      'Notebook C',

    PLACA_NOTEBOOK:
      'Placa de Notebook',

    PONTEIRA_A:
      'Ponteira A',

    PONTEIRA_B:
      'Ponteira B',

    PONTEIRA:
      'Ponteira',

    MAE_A:
      'Mãe A',

    MAE_B:
      'Mãe B',

    MAE_C:
      'Mãe C',

    MAE_D:
      'Mãe D',

    PLACA_MAE:
      'Placa Mãe',

    INTERMEDIARIA_A:
      'Intermediária A',

    INTERMEDIARIA_C:
      'Intermediária C',

    INTERMEDIARIA_D:
      'Intermediária D',

    INTERMEDIARIA_D_MENOS:
      'Intermediária D Menos',

    INTERMEDIARIA:
      'Intermediária',

    ELETRONICA_A:
      'Eletrônica A',

    ELETRONICA_B:
      'Eletrônica B',

    ELETRONICA_C:
      'Eletrônica C',

    ELETRONICA_D:
      'Eletrônica D',

    ELETRONICA_D_MENOS:
      'Eletrônica D Menos',

    ELETRONICA_E:
      'Eletrônica E',

    ELETRONICA:
      'Placa Eletrônica',

    PLACA_LEVE:
      'Placa Leve',

    MISTA_LEVE:
      'Mista Leve',

    MODEM:
      'Modem',

    MODEM_COLORIDA:
      'Modem Colorida',

    SERVIDOR_A:
      'Servidor A',

    SERVIDOR_B:
      'Servidor B',

    SERVIDOR:
      'Servidor',

    SUBCLASSE_NAO_DEFINIDA:
      'Subclasse não definida',

    NAO_CLASSIFICADA:
      'Não classificada',
  };

  return names[category];
}

function buildTechnicalEvidence(
  input: CommercialClassificationV2Input,
): string[] {
  const evidence: string[] = [];

  if (input.boardType) {
    evidence.push(
      `Tipo técnico: ${input.boardType}`,
    );
  }

  if (input.probableName) {
    evidence.push(
      `Nome provável: ${input.probableName}`,
    );
  }

  if (input.equipment) {
    evidence.push(
      `Equipamento: ${input.equipment}`,
    );
  }

  if (input.application) {
    evidence.push(
      `Função: ${input.application}`,
    );
  }

  return evidence;
}

function createResult({
  input,
  family,
  category,
  name,
  commercialConfidence,
  source,
  humanReviewRequired,
  reason,
  evidence,
}: {
  input: CommercialClassificationV2Input;
  family: EcoBoardOperationalFamily;
  category: EcoBoardCommercialCategory;
  name: string;
  commercialConfidence: number;
  source: ClassificationSource;
  humanReviewRequired: boolean;
  reason: string;
  evidence: string[];
}): CommercialClassificationV2Result {
  return {
    family,
    category,
    name,

    technicalConfidence:
      normalizeConfidence(
        input.identificationConfidence,
      ),

    commercialConfidence:
      clamp01(
        commercialConfidence,
      ),

    source,

    humanReviewRequired,

    reason,

    evidence,
  };
}

function createUnclassified(
  input: CommercialClassificationV2Input,
  reason: string,
): CommercialClassificationV2Result {
  return {
    family: 'UNKNOWN',

    category:
      'NAO_CLASSIFICADA',

    name:
      'Não classificada',

    technicalConfidence:
      normalizeConfidence(
        input.identificationConfidence,
      ),

    commercialConfidence: 0,

    source: 'UNCLASSIFIED',

    humanReviewRequired: true,

    reason,

    evidence:
      buildTechnicalEvidence(input),
  };
}

function includesAny(
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
    return clamp01(
      value / 100,
    );
  }

  return clamp01(value);
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

function clamp01(
  value: number,
): number {
  return Math.max(
    0,
    Math.min(
      1,
      value,
    ),
  );
}