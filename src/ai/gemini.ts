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

export async function analyzePCB({
  frontImage,
  backImage,
  context = {},
}: AnalyzePCBInput): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY não encontrada. Verifique o arquivo .env.',
    );
  }

  const ai = new GoogleGenAI({
    apiKey,
  });

  const contextText = buildContextText(context);

  const geminiStart = performance.now();

  const requestConfig = {
  contents: [
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
identificar tecnicamente a placa e classificá-la para venda como sucata eletrônica.

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
- use frente e verso como uma única análise;
- pense exclusivamente em reciclagem e comercialização de sucata eletrônica;
- não calcule preços nesta etapa;
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
  ],

  config: {
    systemInstruction: PCB_SYSTEM_PROMPT,
    responseMimeType: 'application/json',
    ...(USE_SCHEMA_BENCHMARK
      ? { responseSchema: PCB_ANALYSIS_SCHEMA, }
      : {}),
    thinkingConfig: {
      thinkingLevel: 'low',
    },
  },
};

let response;

try {
  const primaryStart = performance.now();

  try {
    response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        ...requestConfig,
      
        config: {
          ...requestConfig.config,
      
          httpOptions: {
            timeout: 8000,
          },
        },
      });

    console.log(
      'ECOBOARD_PRIMARY_TIME:',
      `${((performance.now() - primaryStart) / 1000).toFixed(2)}s`,
    );
  } catch (error) {
    console.warn(
      'ECOBOARD_PRIMARY_FAILED_TIME:',
      `${((performance.now() - primaryStart) / 1000).toFixed(2)}s`,
    );

    throw error;
  }
} catch (error) {
  if (!isTemporaryGeminiError(error)) {
    throw error;
  }

  console.warn(
    'ECOBOARD_GEMINI_FALLBACK:',
    'Gemini 3.7 Flash indisponível. Usando Gemini 3.5 Flash-Lite.',
  );

  const fallbackStart = performance.now();

  response = await ai.models.generateContent({
    model: 'gemini-3.5-flash-lite',
    ...requestConfig,
  });

  console.log(
    'ECOBOARD_FALLBACK_TIME:',
    `${((performance.now() - fallbackStart) / 1000).toFixed(2)}s`,
  );
}

  const geminiEnd = performance.now();

  console.log(
    'ECOBOARD_GEMINI_TIME:',
    `${((geminiEnd - geminiStart) / 1000).toFixed(2)}s`,
  );

  if (!response.text) {
    throw new Error(
      'O Gemini não retornou conteúdo para as imagens enviadas.',
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
  ].filter(Boolean);

  if (values.length === 0) {
    return 'Nenhum contexto adicional foi informado pelo usuário.';
  }

  return `
Contexto adicional informado pelo usuário:
${values.map((value) => `- ${value}`).join('\n')}
  `.trim();
}

function isTemporaryGeminiError(error: unknown): boolean {
    if (!(error instanceof Error)) {
      return false;
    }
  
    const message = error.message.toLowerCase();
  
    return (
      message.includes('503') ||
      message.includes('unavailable') ||
      message.includes('high demand') ||
      message.includes('overloaded') ||
      message.includes('timeout') ||
      message.includes('timed out') ||
      message.includes('deadline') ||
      message.includes('aborted') ||
      error.name === 'AbortError'
    );
  }
  