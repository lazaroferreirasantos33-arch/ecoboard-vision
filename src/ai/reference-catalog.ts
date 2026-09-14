import type {
    PCBReferenceImage,
  } from './gemini';
  
  export type InitialIdentification = {
    identification: {
      board_type: string;
      probable_name: string;
    };
  };
  
  export type CatalogReferenceDefinition =
    Omit<PCBReferenceImage, 'base64' | 'mimeType'> & {
      assetPath: string;
      mimeType: 'image/webp';
    };
  
  export const CATALOG_VERSION =
    'lorene-2023-hd-v1';
  
  export const REFERENCE_SELECTION_VERSION =
    'technical-identification-hd-v1';
  
  const HDD_REFERENCE: CatalogReferenceDefinition = {
    id: 'lorene-2023-p37-placa-hd',
    source: 'Catálogo de Placas Lorene',
    edition: '2023',
    page: 37,
    title: 'Placa de HD',
    codes: ['PVE0016'],
    assetPath:
      'public/catalog-assets/37.webp',
    mimeType: 'image/webp',
  
    notes: [
      'A página possui quatro fotografias de placas de HD.',
      'As fotografias não estão confirmadas como pares de frente e verso.',
      'Uma face com poucos componentes visíveis não comprova que a placa inteira esteja sem componentes.',
      'A correspondência com PLACA_HD é candidata e ainda depende da validação comercial do comprador.',
    ],
  };
  
  function normalizeText(
    value: string,
  ): string {
    return value
      .normalize('NFD')
      .replace(
        /[\u0300-\u036f]/g,
        '',
      )
      .toLowerCase()
      .replace(
        /[_/\\-]+/g,
        ' ',
      )
      .replace(
        /\s+/g,
        ' ',
      )
      .trim();
  }
  
  export function selectCatalogReferences(
    initialResult: InitialIdentification,
  ): CatalogReferenceDefinition[] {
    const boardType =
      normalizeText(
        initialResult.identification
          .board_type ?? '',
      );
  
    const probableName =
      normalizeText(
        initialResult.identification
          .probable_name ?? '',
      );
  
    const technicalIdentification =
      `${boardType} ${probableName}`.trim();
  
    if (!technicalIdentification) {
      return [];
    }
  
    /*
     * A seleção usa somente a identificação
     * técnica inicial.
     *
     * Não utiliza:
     * - categoria comercial;
     * - EcoScore;
     * - fabricante;
     * - notas do operador;
     * - contagem de componentes.
     */
  
    const exclusionSignals = [
      'ssd',
      'solid state',
      'unidade de estado solido',
      'motherboard',
      'mainboard',
      'placa mae',
      'drive optico',
      'optical drive',
      'cd rom',
      'dvd drive',
    ];
  
    if (
      exclusionSignals.some(
        (signal) =>
          technicalIdentification.includes(
            signal,
          ),
      )
    ) {
      return [];
    }
  
    const hddSignals = [
      'hdd controller board',
      'hard drive pcb',
      'hard disk pcb',
      'hard disk drive',
      'placa de hdd',
      'placa de hd',
      'controladora de hdd',
      'controladora de hd',
      'controladora de disco rigido',
      'disco rigido',
    ];
  
    const identifiedAsHdd =
      hddSignals.some(
        (signal) =>
          technicalIdentification.includes(
            signal,
          ),
      );
  
    if (!identifiedAsHdd) {
      return [];
    }
  
    return [HDD_REFERENCE];
  }