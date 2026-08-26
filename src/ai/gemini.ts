import {
  GoogleGenAI,
  ThinkingLevel,
} from '@google/genai';
import { PCB_SYSTEM_PROMPT } from './prompts';
import { PCB_ANALYSIS_SCHEMA } from './schemas';

type PCBImageInput = {
  base64: string;
  mimeType: string;
};

type PCBAnalysisContext = {
  weight?: string;
  quantity?: string;
  origin?: string;
  reference?: string;
  notes?: string;
};

type AnalyzePCBInput = {
  frontImage: PCBImageInput;
  backImage: PCBImageInput;
  context?: PCBAnalysisContext;
};

const PRIMARY_MODEL = 'gemini-3.7-flash';
const FALLBACK_MODEL = 'gemini-3.5-flash-lite';

const PRIMARY_TIMEOUT_MS = 15000;
const FALLBACK_TIMEOUT_MS = 45000;

const COMMERCIAL_TAXONOMY_TEXT = `
TAXONOMIA COMERCIAL ECOBOARD V1

A classificação comercial abaixo representa categorias reais utilizadas
na triagem de sucata eletrônica.

IMPORTANTE:
essas categorias NÃO são modelos técnicos, fabricantes ou famílias
convencionais de equipamentos.

Categorias disponíveis:

1. INTERMEDIARIA_D
Nome comercial: Intermediária D

Categoria utilizada para determinadas placas eletrônicas intermediárias.

Não classifique uma placa como INTERMEDIARIA_D apenas porque ela possui
densidade média ou EcoScore intermediário.

A classificação deve depender da combinação visual da placa, arquitetura,
distribuição dos componentes e características comerciais observáveis.

2. INTERMEDIARIA_D_MENOS
Nome comercial: Intermediária D Menos

Categoria comercial inferior à Intermediária D.

Não utilize essa categoria apenas porque a placa parece simples.
Se não houver evidência suficiente para diferenciar INTERMEDIARIA_D
de INTERMEDIARIA_D_MENOS, utilize NAO_CLASSIFICADA.

3. MAE_B
Nome comercial: Placa Mãe B

Aplicável exclusivamente a motherboards que apresentem características
compatíveis com esta classe comercial.

Identificar tecnicamente uma placa como motherboard NÃO é suficiente para
classificá-la como MAE_B.

4. MAE_C
Nome comercial: Placa Mãe C

Aplicável exclusivamente a motherboards compatíveis com esta classe
comercial.

Não inferir MAE_C apenas por geração, fabricante, tamanho ou EcoScore.

5. MAE_D
Nome comercial: Placa Mãe D

Aplicável exclusivamente a motherboards compatíveis com esta classe
comercial.

Não considerar automaticamente placas modernas ou simples como MAE_D.

6. PONTEIRA_B
Nome comercial: Ponteira B

Categoria utilizada para determinadas placas de expansão eletrônica,
como algumas placas PCI, PCIe e placas gráficas.

A presença de contatos dourados ou conector PCI/PCIe isoladamente
não é suficiente para determinar PONTEIRA_B.

7. PLACA_HD
Nome comercial: Placa HD

Categoria comercial destinada a PCBs controladoras de discos rígidos HDD.

Classifique como PLACA_HD quando houver evidência visual e técnica consistente
de que a PCB pertence originalmente a um disco rígido HDD.

São evidências fortes, especialmente quando aparecem em conjunto:

- formato e geometria característicos de PCB de HDD;
- PCB projetada para montagem diretamente no corpo do disco rígido;
- conectores de alimentação/dados SATA ou interface típica de HDD;
- controladora principal de armazenamento;
- memória/cache ou componentes típicos da eletrônica de HDD;
- contatos ou interface destinados ao conjunto interno do disco;
- identificação técnica como HDD Controller Board;
- equipamento de origem identificado como disco rígido HDD.

REGRA ESPECÍFICA:

Se a análise técnica identificar com alta confiança que a placa é uma
PCB controladora de HDD e as características visuais forem compatíveis,
classifique como PLACA_HD.

Não utilize NAO_CLASSIFICADA apenas por não ser possível identificar
fabricante, modelo ou part number do HDD.

PLACA_HD não depende de fabricante ou modelo específico.

Use NAO_CLASSIFICADA somente quando houver dúvida real se a PCB pertence
a um HDD.

8. NAO_CLASSIFICADA
Nome comercial: Não classificada

Utilize obrigatoriamente esta categoria quando:

- a placa não pertence claramente às categorias disponíveis;
- a diferenciação entre duas categorias não for confiável;
- as imagens não apresentarem evidência visual suficiente;
- a identificação técnica for possível, mas a classe comercial não;
- a confiança na classificação comercial for inferior ao necessário
  para uma decisão operacional segura.

REGRA CENTRAL:

A pergunta da classificação comercial é:

"Tenho uma placa na mão. Em qual categoria de sucata ela entra?"

A resposta deve representar a categoria utilizada na triagem comercial
de sucata eletrônica, e não apenas o nome técnico da placa.

Nunca escolha uma categoria apenas para preencher o campo.

Quando houver dúvida relevante, use:

category: "NAO_CLASSIFICADA"
human_review_required: true
`.trim();

export async function analyzePCB({
  frontImage,
  backImage,
  context = {},
}: AnalyzePCBInput): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY não encontrada. Verifique as variáveis de ambiente.',
    );
  }

  const ai = new GoogleGenAI({
    apiKey,
  });

  const contextText = buildContextText(context);
  const totalStart = performance.now();

  const contents = [
    {
      role: 'user',
      parts: [
        {
          text: `
As duas imagens abaixo pertencem à mesma placa eletrônica.

Imagem 1: frente da placa.
Imagem 2: verso da mesma placa.

Analise as duas imagens em conjunto.

OBJETIVO PRINCIPAL DA ECOBOARD:

Responder de forma rápida e confiável:

"Tenho uma placa na mão. Em qual categoria de sucata ela entra?"

A análise possui duas camadas:

CAMADA 1 — IDENTIFICAÇÃO TÉCNICA

Determine, quando visualmente possível:

1. tipo técnico da placa;
2. nome provável;
3. fabricante;
4. modelo;
5. part number e revisão;
6. equipamento de origem;
7. função original;
8. características construtivas;
9. componentes relevantes;
10. estado físico;
11. potencial relativo para reciclagem.

CAMADA 2 — CLASSIFICAÇÃO COMERCIAL DE SUCATA

Depois da análise técnica, classifique a placa utilizando
EXCLUSIVAMENTE a Taxonomia Comercial EcoBoard V1 abaixo.

${COMMERCIAL_TAXONOMY_TEXT}

REGRAS DE CLASSIFICAÇÃO COMERCIAL:

- a identificação técnica ajuda, mas não determina sozinha a categoria;
- EcoScore não determina sozinho a categoria comercial;
- fabricante não determina sozinho a categoria;
- idade aparente não determina sozinha a categoria;
- cor da PCB não determina sozinha a categoria;
- tamanho da PCB não determina sozinho a categoria;
- não invente regras comerciais;
- não force uma classificação;
- diferencie fatos observados de hipóteses;
- analise sempre frente e verso como uma única PCB;
- utilize visual_evidence para registrar apenas evidências realmente observadas;
- reason deve explicar de forma breve por que a classificação foi escolhida;
- confidence deve representar confiança especificamente na classificação comercial;
- se houver dúvida importante, utilize NAO_CLASSIFICADA;
- se category for NAO_CLASSIFICADA, human_review_required deve ser true;
- quando uma categoria estiver claramente identificada, human_review_required pode ser false.

REGRAS GERAIS:

- não invente fabricante, modelo ou part number;
- quando uma informação técnica não puder ser confirmada, use "não identificado";
- não calcule preço;
- não informe preço por kg;
- não forneça gramas exatas de metais;
- não invente concentração metalúrgica;
- pense exclusivamente no contexto de reciclagem e triagem de sucata eletrônica;
- retorne somente os campos definidos no schema.

${contextText}
          `.trim(),
        },

        {
          inlineData: {
            mimeType: frontImage.mimeType,
            data: frontImage.base64,
          },
        },

        {
          inlineData: {
            mimeType: backImage.mimeType,
            data: backImage.base64,
          },
        },
      ],
    },
  ];

  const baseConfig = {
    systemInstruction: PCB_SYSTEM_PROMPT,
    responseMimeType: 'application/json',
    responseSchema: PCB_ANALYSIS_SCHEMA,
    thinkingConfig: {
      thinkingLevel: ThinkingLevel.LOW,
    },
  };

  let response;

  try {
    response = await runPrimaryModel(
      ai,
      contents,
      baseConfig,
    );
  } catch (primaryError) {
    const primaryKind =
      classifyGeminiError(primaryError);

    if (
      primaryKind !== 'temporary' &&
      primaryKind !== 'quota'
    ) {
      console.error(
        'ECOBOARD_PRIMARY_ERROR:',
        primaryError,
      );

      throw new Error(
        'Não foi possível concluir a análise desta placa. Tente novamente.',
      );
    }

    console.warn(
      'ECOBOARD_GEMINI_FALLBACK:',
      `${PRIMARY_MODEL} indisponível. Tentando ${FALLBACK_MODEL}.`,
    );

    try {
      response = await runFallbackModel(
        ai,
        contents,
        baseConfig,
      );
    } catch (fallbackError) {
      const fallbackKind =
        classifyGeminiError(fallbackError);

      console.error(
        'ECOBOARD_FALLBACK_ERROR:',
        fallbackError,
      );

      if (
        primaryKind === 'quota' &&
        fallbackKind === 'quota'
      ) {
        throw new Error(
          'O limite de análises disponível no momento foi atingido. Tente novamente mais tarde.',
        );
      }

      if (fallbackKind === 'quota') {
        throw new Error(
          'O serviço atingiu o limite de análises disponível no momento. Tente novamente mais tarde.',
        );
      }

      if (fallbackKind === 'temporary') {
        throw new Error(
          'O serviço de análise está temporariamente indisponível ou sobrecarregado. Aguarde alguns segundos e tente novamente.',
        );
      }

      throw new Error(
        'Não foi possível concluir a análise desta placa. Tente novamente.',
      );
    }
  }

  console.log(
    'ECOBOARD_GEMINI_TIME:',
    `${secondsSince(totalStart)}s`,
  );

  if (!response?.text) {
    throw new Error(
      'A inteligência artificial não retornou conteúdo para as imagens enviadas.',
    );
  }

  return response.text;
}

async function runPrimaryModel(
  ai: GoogleGenAI,
  contents: Parameters<
    GoogleGenAI['models']['generateContent']
  >[0]['contents'],
  baseConfig: Parameters<
    GoogleGenAI['models']['generateContent']
  >[0]['config'],
) {
  const primaryStart = performance.now();

  try {
    const response =
      await ai.models.generateContent({
        model: PRIMARY_MODEL,
        contents,
        config: {
          ...baseConfig,

          httpOptions: {
            timeout: PRIMARY_TIMEOUT_MS,
          },
        },
      });

    console.log(
      'ECOBOARD_PRIMARY_TIME:',
      `${secondsSince(primaryStart)}s`,
    );

    return response;
  } catch (error) {
    console.warn(
      'ECOBOARD_PRIMARY_FAILED_TIME:',
      `${secondsSince(primaryStart)}s`,
    );

    throw error;
  }
}

async function runFallbackModel(
  ai: GoogleGenAI,
  contents: Parameters<
    GoogleGenAI['models']['generateContent']
  >[0]['contents'],
  baseConfig: Parameters<
    GoogleGenAI['models']['generateContent']
  >[0]['config'],
) {
  const fallbackStart = performance.now();

  try {
    const response =
      await ai.models.generateContent({
        model: FALLBACK_MODEL,
        contents,
        config: {
          ...baseConfig,

          httpOptions: {
            timeout: FALLBACK_TIMEOUT_MS,
          },
        },
      });

    console.log(
      'ECOBOARD_FALLBACK_TIME:',
      `${secondsSince(fallbackStart)}s`,
    );

    return response;
  } catch (error) {
    console.error(
      'ECOBOARD_FALLBACK_FAILED_TIME:',
      `${secondsSince(fallbackStart)}s`,
    );

    throw error;
  }
}

function buildContextText(
  context: PCBAnalysisContext,
): string {
  const values = [
    context.weight
      ? `Peso informado: ${context.weight} kg`
      : null,

    context.quantity
      ? `Quantidade informada: ${context.quantity}`
      : null,

    context.origin
      ? `Origem informada pelo usuário: ${context.origin}`
      : null,

    context.reference
      ? `Referência ou modelo informado pelo usuário: ${context.reference}`
      : null,

    context.notes
      ? `Observações do usuário: ${context.notes}`
      : null,
  ].filter(
    (value): value is string =>
      Boolean(value),
  );

  if (values.length === 0) {
    return 'Nenhum contexto adicional foi informado pelo usuário.';
  }

  return `
Contexto adicional informado pelo usuário:
${values
  .map((value) => `- ${value}`)
  .join('\n')}
  `.trim();
}

type GeminiErrorKind =
  | 'quota'
  | 'temporary'
  | 'other';

function classifyGeminiError(
  error: unknown,
): GeminiErrorKind {
  if (!(error instanceof Error)) {
    return 'other';
  }

  const message =
    error.message.toLowerCase();

  if (
    message.includes('429') ||
    message.includes(
      'resource_exhausted',
    ) ||
    message.includes(
      'quota exceeded',
    ) ||
    message.includes('rate limit') ||
    message.includes(
      'generate_content_free_tier_requests',
    )
  ) {
    return 'quota';
  }

  if (
    error.name === 'AbortError' ||
    message.includes('503') ||
    message.includes('unavailable') ||
    message.includes('high demand') ||
    message.includes('overloaded') ||
    message.includes('timeout') ||
    message.includes('timed out') ||
    message.includes('deadline') ||
    message.includes('aborted') ||
    message.includes(
      'operation was aborted',
    )
  ) {
    return 'temporary';
  }

  return 'other';
}

function secondsSince(
  start: number,
): string {
  return (
    (performance.now() - start) /
    1000
  ).toFixed(2);
}