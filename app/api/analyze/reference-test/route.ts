import {
  NextResponse,
} from 'next/server';

import {
  createHash,
  randomUUID,
} from 'crypto';

import {
  get as httpGet,
} from 'http';

import {
  get as httpsGet,
} from 'https';

import {
  analyzePCBWithMetadata,
} from '@/src/ai/gemini';

import {
  CATALOG_VERSION,
  REFERENCE_SELECTION_VERSION,
  selectCatalogReferences,
} from '@/src/ai/reference-catalog';
  
  export const runtime = 'nodejs';
  export const dynamic = 'force-dynamic';
  
  const ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
  ];
  
  const MAX_IMAGE_SIZE =
    10 * 1024 * 1024;
  
  const MAX_BASELINE_LENGTH =
    100000;
  
  function getImage(
    formData: FormData,
    fieldName: string,
  ): File | null {
    const value =
      formData.get(fieldName);
  
    return (
      value instanceof File &&
      value.size > 0
    )
      ? value
      : null;
  }
  
  function validateImage(
    file: File | null,
    required: boolean,
  ): string | null {
    if (!file) {
      return required
        ? 'A imagem da frente da placa é obrigatória.'
        : null;
    }
  
    if (
      !ALLOWED_IMAGE_TYPES.includes(
        file.type,
      )
    ) {
      return 'Use imagens JPG, PNG ou WEBP.';
    }
  
    if (
      file.size > MAX_IMAGE_SIZE
    ) {
      return 'Cada imagem deve possuir no máximo 10 MB.';
    }
  
    return null;
  }
  
  async function fileToBuffer(
    file: File,
  ): Promise<Buffer> {
    return Buffer.from(
      await file.arrayBuffer(),
    );
  }
  
  function hashBuffer(
    buffer: Buffer,
  ): string {
    return createHash('sha256')
      .update(buffer)
      .digest('hex');
  }
  
  function getContextValue(
    formData: FormData,
    fieldName: string,
  ): string {
    const value =
      formData.get(fieldName);
  
    if (
      typeof value !== 'string'
    ) {
      return '';
    }
  
    return value
      .slice(0, 4000);
  }
  
  function isInitialResult(
    value: unknown,
  ): value is {
    identification: {
      board_type: string;
      probable_name: string;
    };
  } {
    if (
      !value ||
      typeof value !== 'object'
    ) {
      return false;
    }
  
    const identification =
      (
        value as {
          identification?: unknown;
        }
      ).identification;
  
    if (
      !identification ||
      typeof identification !== 'object'
    ) {
      return false;
    }
  
    const fields =
      identification as {
        board_type?: unknown;
        probable_name?: unknown;
      };
  
    return (
      typeof fields.board_type ===
        'string' &&
      typeof fields.probable_name ===
        'string'
    );
  }
  
  function parseGeminiResult(
    responseText: string,
  ): unknown {
    let parsed: unknown;
  
    try {
      parsed =
        JSON.parse(responseText);
    } catch {
      throw new Error(
        'REFERENCE_TEST_INVALID_JSON',
      );
    }
  
    if (
      !parsed ||
      typeof parsed !== 'object'
    ) {
      throw new Error(
        'REFERENCE_TEST_INVALID_RESULT',
      );
    }
  
    const result =
      parsed as {
        identification?: unknown;
        commercial_classification?: unknown;
      };
  
    if (
      !result.identification ||
      typeof result.identification !==
        'object' ||
      !result.commercial_classification ||
      typeof result
        .commercial_classification !==
        'object'
    ) {
      throw new Error(
        'REFERENCE_TEST_INVALID_RESULT',
      );
    }
  
    return parsed;
  }

  function downloadReferenceAsset(
    assetUrl: URL,
  ): Promise<Buffer> {
    return new Promise(
      (resolve, reject) => {
        const requestAsset =
          assetUrl.protocol === 'https:'
            ? httpsGet
            : httpGet;
  
        const assetRequest =
          requestAsset(
            assetUrl,
            (response) => {
              if (
                response.statusCode !==
                200
              ) {
                response.resume();
  
                reject(
                  new Error(
                    `REFERENCE_ASSET_HTTP_${response.statusCode ?? 'UNKNOWN'}`,
                  ),
                );
  
                return;
              }
  
              const chunks: Buffer[] =
                [];
  
              let totalSize = 0;
  
              response.on(
                'data',
                (chunk: Buffer) => {
                  totalSize +=
                    chunk.length;
  
                  if (
                    totalSize >
                    2 * 1024 * 1024
                  ) {
                    response.destroy(
                      new Error(
                        'REFERENCE_ASSET_TOO_LARGE',
                      ),
                    );
  
                    return;
                  }
  
                  chunks.push(chunk);
                },
              );
  
              response.on(
                'end',
                () => {
                  resolve(
                    Buffer.concat(
                      chunks,
                    ),
                  );
                },
              );
  
              response.on(
                'error',
                reject,
              );
            },
          );
  
        assetRequest.on(
          'error',
          reject,
        );
      },
    );
  }
  
  export async function POST(
    request: Request,
  ) {
    const totalStart =
      performance.now();
  
    try {
      const formData =
        await request.formData();
  
      const frontImage =
        getImage(
          formData,
          'frontImage',
        );
  
      const backImage =
        getImage(
          formData,
          'backImage',
        );
  
      const frontError =
        validateImage(
          frontImage,
          true,
        );
  
      if (frontError) {
        return NextResponse.json(
          {
            success: false,
            error: frontError,
          },
          {
            status: 400,
          },
        );
      }
  
      const backError =
        validateImage(
          backImage,
          false,
        );
  
      if (backError) {
        return NextResponse.json(
          {
            success: false,
            error: backError,
          },
          {
            status: 400,
          },
        );
      }
  
      if (!frontImage) {
        return NextResponse.json(
          {
            success: false,
            error:
              'A imagem da frente da placa é obrigatória.',
          },
          {
            status: 400,
          },
        );
      }
  
      const baselineText =
        formData.get('baseline');
  
      if (
        typeof baselineText !==
          'string' ||
        baselineText.length >
          MAX_BASELINE_LENGTH
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              'O laudo inicial é inválido. Faça uma nova análise.',
          },
          {
            status: 400,
          },
        );
      }
  
      let baseline: unknown;
  
      try {
        baseline =
          JSON.parse(baselineText);
      } catch {
        return NextResponse.json(
          {
            success: false,
            error:
              'O laudo inicial é inválido. Faça uma nova análise.',
          },
          {
            status: 400,
          },
        );
      }
  
      if (
        !isInitialResult(baseline)
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              'O laudo inicial não possui identificação técnica válida.',
          },
          {
            status: 400,
          },
        );
      }
  
      const selectedReferences =
        selectCatalogReferences(
          baseline,
        );
  
      const frontBuffer =
        await fileToBuffer(
          frontImage,
        );
  
      const backBuffer =
        backImage
          ? await fileToBuffer(
              backImage,
            )
          : null;
  
      const testIdentity = {
        testId: randomUUID(),
  
        createdAt:
          new Date().toISOString(),
  
        catalogVersion:
          CATALOG_VERSION,
  
        selectionVersion:
          REFERENCE_SELECTION_VERSION,
  
        photoHashes: {
          front:
            hashBuffer(frontBuffer),
  
          back:
            backBuffer
              ? hashBuffer(backBuffer)
              : null,
        },
      };
  
      if (
        selectedReferences.length === 0
      ) {
        return NextResponse.json({
          success: true,
  
          comparison: {
            ...testIdentity,
  
            status: 'skipped',
  
            reason:
              'A identificação inicial não selecionou uma referência compatível com este teste. O laudo atual foi mantido.',
  
            references: [],
  
            elapsedMs: Math.round(
              performance.now() -
                totalStart,
            ),
          },
        });
      }
  
      const referenceImages =
  await Promise.all(
    selectedReferences
      .slice(0, 2)
      .map(
        async (
          reference,
        ) => {
          /*
           * O endereço é definido
           * internamente no catálogo.
           * Nenhuma URL enviada pelo
           * navegador é utilizada.
           */
          const assetUrl =
            new URL(
              reference.assetPath,
            );

          const referenceBuffer =
            await downloadReferenceAsset(
              assetUrl,
            );

          if (
            referenceBuffer.length ===
              0 ||
            referenceBuffer.length >
              2 * 1024 * 1024
          ) {
            throw new Error(
              'REFERENCE_ASSET_INVALID',
            );
          }

          const riff =
            referenceBuffer
              .subarray(0, 4)
              .toString('ascii');

          const webp =
            referenceBuffer
              .subarray(8, 12)
              .toString('ascii');

          if (
            riff !== 'RIFF' ||
            webp !== 'WEBP'
          ) {
            throw new Error(
              'REFERENCE_ASSET_INVALID',
            );
          }

          return {
            id: reference.id,
            source:
              reference.source,
            edition:
              reference.edition,
            page:
              reference.page,
            title:
              reference.title,
            codes: [
              ...reference.codes,
            ],
            notes: [
              ...reference.notes,
            ],
            mimeType:
              reference.mimeType,
            base64:
              referenceBuffer
                .toString(
                  'base64',
                ),
          };
        },
      ),
  );
      const analysis =
        await analyzePCBWithMetadata({
          frontImage: {
            base64:
              frontBuffer.toString(
                'base64',
              ),
            mimeType:
              frontImage.type,
          },
  
          backImage:
            backImage &&
            backBuffer
              ? {
                  base64:
                    backBuffer.toString(
                      'base64',
                    ),
                  mimeType:
                    backImage.type,
                }
              : undefined,
  
          context: {
            weight:
              getContextValue(
                formData,
                'weight',
              ),
  
            quantity:
              getContextValue(
                formData,
                'quantity',
              ),
  
            origin:
              getContextValue(
                formData,
                'origin',
              ),
  
            reference:
              getContextValue(
                formData,
                'reference',
              ),
  
            notes:
              getContextValue(
                formData,
                'notes',
              ),
          },
  
          referenceImages,
        });
  
      const parsedResult =
        parseGeminiResult(
          analysis.text,
        );
  
      const elapsedMs =
        Math.round(
          performance.now() -
            totalStart,
        );
  
      console.log(
        'ECOBOARD_REFERENCE_TEST:',
        JSON.stringify({
          testId:
            testIdentity.testId,
  
          catalogVersion:
            CATALOG_VERSION,
  
          selectionVersion:
            REFERENCE_SELECTION_VERSION,
  
          referencePages:
            selectedReferences.map(
              (reference) =>
                reference.page,
            ),
  
          model:
            analysis.metadata.model,
  
          fallbackUsed:
            analysis.metadata
              .fallbackUsed,
  
          tokens:
            analysis.metadata.tokens,
  
          elapsedMs,
        }),
      );
  
      return NextResponse.json({
        success: true,
  
        comparison: {
          ...testIdentity,
  
          status: 'completed',
  
          references:
            analysis.metadata.references,
  
          data:
            parsedResult,
  
          metadata:
            analysis.metadata,
  
          elapsedMs,
        },
      });
    } catch (error) {
      console.error(
        'ECOBOARD_REFERENCE_TEST_ERROR:',
        error,
      );
  
      return NextResponse.json(
        {
          success: false,
  
          error:
            'Não foi possível concluir a comparação. O laudo atual foi mantido. Tente novamente mais tarde.',
        },
        {
          status: 502,
        },
      );
    }
  }