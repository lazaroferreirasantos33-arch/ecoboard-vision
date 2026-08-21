import { GoogleGenAI } from '@google/genai';
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

const PRIMARY_TIMEOUT_MS = 8000;
const FALLBACK_TIMEOUT_MS = 12000;

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

Objetivo principal:
identificar tecnicamente a placa e classificá-la para reciclagem e comercialização como sucata eletrônica.

Prioridades da análise:
1. determinar o tipo da placa;
2. identificar o nome provável;
3. procurar fabricante, modelo, part number e revisão;
4. indicar o equipamento de origem;
5. descrever a função original da placa;
6. identificar características construtivas;
7. contar componentes relevantes visíveis;
8. avaliar o estado físico;
9. classificar o potencial para reciclagem;
10. indicar o potencial relativo de metais recuperáveis.

Regras:
- não invente fabricante, modelo ou part number;
- quando uma informação não puder ser confirmada, use "não identificado";
- diferencie informação observada de identificação provável;
- analise frente e verso como partes da mesma PCB;
- pense exclusivamente em reciclagem e comercialização de sucata eletrônica;
- não calcule preços;
- não forneça gramas exatas de metais;
- retorne somente os campos previstos no schema.

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
      thinkingLevel: 'low' as const,
    },
  };

  let response;

  try {
    const primaryStart = performance.now();

    try {
      response = await ai.models.generateContent({
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
    } catch (primaryError) {
      console.warn(
        'ECOBOARD_PRIMARY_FAILED_TIME:',
        `${secondsSince(primaryStart)}s`,
      );

      throw primaryError;
    }
  } catch (primaryError) {
    if (!isTemporaryGeminiError(primaryError)) {
      console.error(
        'ECOBOARD_PRIMARY_ERROR:',
        primaryError,
      );

      throw primaryError;
    }

    console.warn(
      'ECOBOARD_GEMINI_FALLBACK:',
      `${PRIMARY_MODEL} indisponível ou lento. Usando ${FALLBACK_MODEL}.`,
    );

    const fallbackStart = performance.now();

    try {
      response = await ai.models.generateContent({
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
    } catch (fallbackError) {
      console.error(
        'ECOBOARD_FALLBACK_FAILED_TIME:',
        `${secondsSince(fallbackStart)}s`,
      );

      console.error(
        'ECOBOARD_FALLBACK_ERROR:',
        fallbackError,
      );

      if (isTemporaryGeminiError(fallbackError)) {
        throw new Error(
          'O serviço de análise está temporariamente sobrecarregado. Aguarde alguns segundos e tente novamente.',
        );
      }

      throw fallbackError;
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
  ].filter((value): value is string => Boolean(value));

  if (values.length === 0) {
    return 'Nenhum contexto adicional foi informado pelo usuário.';
  }

  return `
Contexto adicional informado pelo usuário:
${values.map((value) => `- ${value}`).join('\n')}
  `.trim();
}

function isTemporaryGeminiError(
  error: unknown,
): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();

  return (
    error.name === 'AbortError' ||
    message.includes('503') ||
    message.includes('unavailable') ||
    message.includes('high demand') ||
    message.includes('overloaded') ||
    message.includes('timeout') ||
    message.includes('timed out') ||
    message.includes('deadline') ||
    message.includes('aborted') ||
    message.includes('operation was aborted')
  );
}

function secondsSince(
  start: number,
): string {
  return (
    (performance.now() - start) /
    1000
  ).toFixed(2);
}