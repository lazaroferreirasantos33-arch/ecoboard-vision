import { NextRequest, NextResponse } from 'next/server';
import { analyzePCB } from '@/src/ai/gemini';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024;

function getFile(
  formData: FormData,
  fieldName: string,
): File | null {
  const value = formData.get(fieldName);

  return value instanceof File && value.size > 0 ? value : null;
}

function validateImage(
  file: File | null,
  label: string,
  required: boolean,
): string | null {
  if (!file) {
    return required
      ? `A imagem da ${label} da placa é obrigatória.`
      : null;
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return `Formato inválido na imagem da ${label}. Use JPG, PNG ou WEBP.`;
  }

  if (file.size > MAX_FILE_SIZE) {
    return `A imagem da ${label} excede o limite de 10 MB.`;
  }

  return null;
}

async function fileToBase64(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());

  return buffer.toString('base64');
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const frontImage = getFile(formData, 'frontImage');
    const backImage = getFile(formData, 'backImage');

    const frontError = validateImage(
      frontImage,
      'frente',
      true,
    );

    if (frontError) {
      return NextResponse.json(
        {
          success: false,
          error: frontError,
        },
        { status: 400 },
      );
    }

    const backError = validateImage(
      backImage,
      'verso',
      false,
    );

    if (backError) {
      return NextResponse.json(
        {
          success: false,
          error: backError,
        },
        { status: 400 },
      );
    }

    if (!frontImage) {
      return NextResponse.json(
        {
          success: false,
          error: 'A imagem da frente da placa é obrigatória.',
        },
        { status: 400 },
      );
    }

    const frontBase64 = await fileToBase64(frontImage);
    const backBase64 = backImage
      ? await fileToBase64(backImage)
      : null;

    const resultText = await analyzePCB({
      frontImage: {
        base64: frontBase64,
        mimeType: frontImage.type,
      },

      backImage:
        backImage && backBase64
          ? {
              base64: backBase64,
              mimeType: backImage.type,
            }
          : undefined,

      context: {
        weight: String(formData.get('weight') ?? ''),
        quantity: String(formData.get('quantity') ?? '1'),
        origin: String(formData.get('origin') ?? ''),
        reference: String(formData.get('reference') ?? ''),
        notes: String(formData.get('notes') ?? ''),
      },
    });

    let parsedResult: unknown;

    try {
      parsedResult = JSON.parse(resultText);
    } catch {
      console.error(
        'ECOBOARD_INVALID_GEMINI_JSON:',
        resultText,
      );

      return NextResponse.json(
        {
          success: false,
          error:
            'A IA retornou uma resposta fora do formato esperado.',
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      success: true,
      data: parsedResult,
    });
  } catch (error) {
    console.error('ECOBOARD_ANALYZE_ERROR:', error);

    const message =
      error instanceof Error
        ? error.message
        : 'Erro inesperado durante a análise.';

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 },
    );
  }
}
