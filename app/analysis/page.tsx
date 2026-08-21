'use client';

import Link from 'next/link';
import { calculateEcoScore } from '@/src/ecoboard/ecoscore';
import { mapBoardTypeToFamily } from '@/src/ecoboard/family-mapper';
import {
  formatBenchmarkStatus,
  validateEcoScoreBenchmark,
} from '@/src/ecoboard/benchmark';
import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useRef,
  useState,
} from 'react';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

type ImageSide = 'front' | 'back';

type SelectedImage = {
  file: File;
  previewUrl: string;
};

type AnalysisResult = {
  analysis: {
    confidence: number;
  };

  identification: {
    board_type: string;
    probable_name: string;
    manufacturer: string;
    model: string;
    part_number: string;
    equipment: string;
    application: string;
    confidence: number;
  };

  engineering: {
    technology: string;
    estimated_layers: number;
    density: string;
    condition: string;
    integrity: number;
  };

  components: {
    cpu: number;
    fpga: number;
    asic: number;
    bga: number;
    memory: number;
    gold_fingers: number;
    tantalum: number;
    transformers: number;
    connectors: number;
    relays: number;
    oscillators: number;
  };

  recycling: {
    commercial_grade: string;
    eco_score: number;
    gold: string;
    silver: string;
    palladium: string;
    copper: string;
  };

  recommendation: {
    decision: string;
    reason: string;
  };
};

export default function AnalysisPage() {
  const [frontImage, setFrontImage] = useState<SelectedImage | null>(
    null,
  );

  const [backImage, setBackImage] = useState<SelectedImage | null>(
    null,
  );

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const resultRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
    if (!result) {
      return;
    }

    resultRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }, [result]);

  function validateFile(file: File): string | null {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Formato inválido. Use JPG, PNG ou WEBP.';
    }

    if (file.size > MAX_FILE_SIZE) {
      return 'A imagem excede o limite de 10 MB.';
    }

    return null;
  }

  function handleImageChange(
    event: ChangeEvent<HTMLInputElement>,
    side: ImageSide,
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const validationError = validateFile(file);

    if (validationError) {
      setError(validationError);
      event.target.value = '';
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    if (side === 'front') {
      if (frontImage) {
        URL.revokeObjectURL(frontImage.previewUrl);
      }

      setFrontImage({
        file,
        previewUrl,
      });
    } else {
      if (backImage) {
        URL.revokeObjectURL(backImage.previewUrl);
      }

      setBackImage({
        file,
        previewUrl,
      });
    }

    setResult(null);
    setError('');
  }

  function removeImage(side: ImageSide) {
    if (side === 'front') {
      if (frontImage) {
        URL.revokeObjectURL(frontImage.previewUrl);
      }

      setFrontImage(null);
    } else {
      if (backImage) {
        URL.revokeObjectURL(backImage.previewUrl);
      }

      setBackImage(null);
    }

    setResult(null);
    setError('');
  }

  function resetAnalysis() {
    if (frontImage) {
      URL.revokeObjectURL(frontImage.previewUrl);
    }

    if (backImage) {
      URL.revokeObjectURL(backImage.previewUrl);
    }

    setFrontImage(null);
    setBackImage(null);
    setResult(null);
    setError('');
  }

  async function compressImage(
    file: File,
    maxWidth = 1600,
    maxHeight = 1600,
    quality = 0.82,
  ): Promise<File> {
    const imageBitmap = await createImageBitmap(file);
  
    const scale = Math.min(
      1,
      maxWidth / imageBitmap.width,
      maxHeight / imageBitmap.height,
    );
  
    const width = Math.round(imageBitmap.width * scale);
    const height = Math.round(imageBitmap.height * scale);
  
    const canvas = document.createElement('canvas');
  
    canvas.width = width;
    canvas.height = height;
  
    const context = canvas.getContext('2d');
  
    if (!context) {
      throw new Error(
        'Não foi possível preparar a imagem para análise.',
      );
    }
  
    context.drawImage(
      imageBitmap,
      0,
      0,
      width,
      height,
    );
  
    imageBitmap.close();
  
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => {
          if (!result) {
            reject(
              new Error(
                'Não foi possível comprimir a fotografia.',
              ),
            );
  
            return;
          }
  
          resolve(result);
        },
        'image/jpeg',
        quality,
      );
    });
  
    const originalName = file.name.replace(
      /\.[^/.]+$/,
      '',
    );

    const optimizedFile = new File(
      [blob],
      `${originalName}-optimized.jpg`,
      {
        type: 'image/jpeg',
        lastModified: Date.now(),
      },
    );

    if (optimizedFile.size >= file.size) {
      return file;
    }
    
    return optimizedFile;
  
    return new File(
      [blob],
      `${originalName}-optimized.jpg`,
      {
        type: 'image/jpeg',
        lastModified: Date.now(),
      },
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!frontImage) {
      setError('Envie a fotografia da frente da placa.');
      return;
    }

    if (!backImage) {
      setError('Envie a fotografia do verso da placa.');
      return;
    }

    setError('');
    setResult(null);
    setIsSubmitting(true);
    const totalStart = performance.now();

    try {
      const formData = new FormData(event.currentTarget);

      const compressionStart = performance.now();

const [optimizedFrontImage, optimizedBackImage] =
  await Promise.all([
    compressImage(frontImage.file),
    compressImage(backImage.file),
  ]);

  const compressionEnd = performance.now();

console.log(
  'Tempo compressão:',
  `${((compressionEnd - compressionStart) / 1000).toFixed(2)}s`,
);

console.log(
  'Frente:',
  `${(frontImage.file.size / 1024 / 1024).toFixed(2)} MB`,
  '→',
  `${(optimizedFrontImage.size / 1024 / 1024).toFixed(2)} MB`,
);

console.log(
  'Verso:',
  `${(backImage.file.size / 1024 / 1024).toFixed(2)} MB`,
  '→',
  `${(optimizedBackImage.size / 1024 / 1024).toFixed(2)} MB`,
);

formData.set(
  'frontImage',
  optimizedFrontImage,
);

formData.set(
  'backImage',
  optimizedBackImage,
);

const requestStart = performance.now();

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      const requestEnd = performance.now();

console.log(
  'Tempo API:',
  `${((requestEnd - requestStart) / 1000).toFixed(2)}s`,
);

      const responseText = await response.text();

let apiResult: {
  success?: boolean;
  data?: AnalysisResult;
  error?: string;
};

try {
  apiResult = JSON.parse(responseText);
} catch {
  console.error('Resposta não JSON da API:', responseText);

  throw new Error(
    `A rota de análise retornou uma página de erro do servidor. Status: ${response.status}. Verifique o terminal do StackBlitz.`,
  );
}

if (!response.ok || !apiResult.success) {
  throw new Error(
    apiResult.error || 'Não foi possível analisar a placa.',
  );
}

if (!apiResult.data) {
  throw new Error(
    'A API não retornou o laudo da placa.',
  );
}

setResult(apiResult.data);

const totalEnd = performance.now();

console.log(
  'Tempo total:',
  `${((totalEnd - totalStart) / 1000).toFixed(2)}s`,
);
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : 'Erro inesperado durante a análise.';

      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const canSubmit =
    Boolean(frontImage) &&
    Boolean(backImage) &&
    !isSubmitting;

  return (
    <main className="min-h-screen bg-[#07110d] text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-400/10">
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5 text-emerald-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <path d="M8 3v4M16 3v4M8 17v4M16 17v4M3 8h4M17 8h4M3 16h4M17 16h4" />
                <rect x="7" y="7" width="10" height="10" rx="2" />
                <path d="M10 10h4v4h-4z" />
              </svg>
            </div>

            <div>
              <p className="text-sm font-semibold tracking-[0.18em]">
                ECOBOARD
              </p>

              <p className="text-[10px] uppercase tracking-[0.28em] text-emerald-400">
  Inteligência em Reciclagem
</p>
            </div>
          </Link>

          <Link
            href="/"
            className="text-sm text-white/50 transition hover:text-white"
          >
            Voltar ao início
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-14 lg:px-8 lg:py-20">
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400">
            Nova avaliação de sucata
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
            Identificação técnica da PCB
          </h1>

          <p className="mt-5 max-w-3xl text-sm leading-7 text-white/45">
            Envie fotografias nítidas da frente e do verso da mesma
            placa. A EcoBoard tentará identificar o tipo, fabricante,
            modelo, função, características, componentes e potencial
            para reciclagem.
          </p>
        </div>

        <form className="grid gap-6" onSubmit={handleSubmit}>
          <section className="grid gap-6 lg:grid-cols-2">
            <ImageUploadCard
              title="Frente da placa"
              description="Fotografe toda a face principal, incluindo componentes, etiquetas e inscrições."
              image={frontImage}
              side="front"
              onChange={handleImageChange}
              onRemove={removeImage}
            />

            <ImageUploadCard
              title="Verso da placa"
              description="Fotografe toda a face traseira, incluindo trilhas, códigos e contatos."
              image={backImage}
              side="back"
              onChange={handleImageChange}
              onRemove={removeImage}
            />
          </section>

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-300"
            >
              {error}
            </div>
          )}

{isSubmitting && (
  <section className="overflow-hidden rounded-3xl border border-emerald-400/20 bg-emerald-400/[0.035]">
    <div className="flex flex-col items-center px-6 py-10 text-center sm:px-10 sm:py-12">
      <div className="relative flex h-16 w-16 items-center justify-center">
        <div className="absolute inset-0 animate-ping rounded-full border border-emerald-400/20" />

        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/10">
          <svg
            viewBox="0 0 24 24"
            className="h-7 w-7 animate-pulse text-emerald-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            aria-hidden="true"
          >
            <path d="M8 3v4M16 3v4M8 17v4M16 17v4M3 8h4M17 8h4M3 16h4M17 16h4" />
            <rect
              x="7"
              y="7"
              width="10"
              height="10"
              rx="2"
            />
            <path d="M10 10h4v4h-4z" />
          </svg>
        </div>
      </div>

      <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
        EcoBoard Intelligence
      </p>

      <h2 className="mt-3 text-2xl font-semibold">
        Analisando sua PCB
      </h2>

      <p className="mt-3 max-w-xl text-sm leading-7 text-white/45">
        A EcoBoard está processando as imagens da frente e do verso
        para gerar uma leitura técnica estruturada da placa.
      </p>

      <div className="mt-8 grid w-full max-w-2xl gap-3 text-left sm:grid-cols-2">
        <ProcessingStep
          title="Frente e verso"
          description="Preparando as imagens da PCB"
        />

        <ProcessingStep
          title="Identificação técnica"
          description="Buscando tipo, fabricante e modelo"
        />

        <ProcessingStep
          title="Componentes"
          description="Analisando elementos relevantes"
        />

        <ProcessingStep
          title="Reciclagem"
          description="Gerando classificação e parecer"
        />
      </div>

      <div className="mt-8 flex items-center gap-2 text-xs text-white/35">
        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
        Isso pode levar alguns segundos
      </div>
    </div>
  </section>
)}

<div className="flex justify-end">
  <button
    type="submit"
    disabled={!canSubmit}
    className="inline-flex w-full items-center justify-center gap-3 rounded-xl bg-emerald-400 px-7 py-4 text-base font-semibold text-[#07110d] transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-w-56"
  >
    {isSubmitting ? (
      <>
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#07110d]/30 border-t-[#07110d]" />
        Processando...
      </>
    ) : (
      'Analisar PCB'
    )}
  </button>
</div>
        </form>

        {result && (
          <div ref={resultRef} className="scroll-mt-8 pt-10">
            <AnalysisReport
              result={result}
              frontPreview={frontImage?.previewUrl ?? ''}
              backPreview={backImage?.previewUrl ?? ''}
              onReset={resetAnalysis}
            />
          </div>
        )}
      </section>
    </main>
  );
}

function ProcessingStep({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-400/10">
        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
      </div>

      <div>
        <p className="text-sm font-semibold text-white">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-white/35">
          {description}
        </p>
      </div>
    </div>
  );
}

type ImageUploadCardProps = {
  title: string;
  description: string;
  image: SelectedImage | null;
  side: ImageSide;
  onChange: (
    event: ChangeEvent<HTMLInputElement>,
    side: ImageSide,
  ) => void;
  onRemove: (side: ImageSide) => void;
};

function ImageUploadCard({
  title,
  description,
  image,
  side,
  onChange,
  onRemove,
}: ImageUploadCardProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-400">
          Obrigatória
        </p>

        <h2 className="mt-2 text-xl font-semibold">
          {title}
        </h2>

        <p className="mt-2 text-sm leading-6 text-white/40">
          {description}
        </p>
      </div>

      {!image ? (
        <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-emerald-400/30 bg-emerald-400/[0.025] px-5 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10">
            <svg
              viewBox="0 0 24 24"
              className="h-7 w-7 text-emerald-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              aria-hidden="true"
            >
              <path d="M4 7h3l1.5-2h7L17 7h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </div>

          <h3 className="mt-5 text-lg font-semibold">
            Fotografar placa
          </h3>

          <p className="mt-2 max-w-sm text-sm leading-6 text-white/40">
            Use a câmera traseira e fotografe toda a face da PCB.
          </p>

          <label className="mt-6 inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-400 px-6 py-3.5 text-sm font-semibold text-[#07110d] transition hover:bg-emerald-300">
            <span aria-hidden="true">📷</span>
            Tirar foto

            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(event) => onChange(event, side)}
            />
          </label>

          <div className="mt-5 max-w-sm rounded-xl border border-white/10 bg-black/20 px-4 py-3">
            <p className="text-xs leading-5 text-white/35">
              Mantenha a placa inteira no enquadramento, evite reflexos e
              fotografe perpendicularmente à superfície.
            </p>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/20">
          <div className="flex min-h-72 items-center justify-center bg-black/30">
            <img
              src={image.previewUrl}
              alt={title}
              className="max-h-[420px] w-full object-contain"
            />
          </div>

          <div className="border-t border-white/10 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {title}
                </p>

                <p className="mt-1 text-xs text-white/35">
                  {(image.file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>

              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-300">
                Foto pronta
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <label className="cursor-pointer rounded-lg border border-emerald-400/20 bg-emerald-400/[0.06] px-4 py-2 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-400/10">
                📷 Tirar novamente

                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(event) => onChange(event, side)}
                />
              </label>

              <button
                type="button"
                onClick={() => onRemove(side)}
                className="rounded-lg border border-red-400/20 bg-red-400/5 px-4 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-400/10"
              >
                Remover
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

type AnalysisReportProps = {
  result: AnalysisResult;
  frontPreview: string;
  backPreview: string;
  onReset: () => void;
};

function AnalysisReport({
  result,
  frontPreview,
  backPreview,
  onReset,
}: AnalysisReportProps) {
  const ecoScore = calculateEcoScore({
    components: {
      cpu: result.components.cpu,
      fpga: result.components.fpga,
      asic: result.components.asic,
      bga: result.components.bga,
      memory: result.components.memory,
      goldFingers: result.components.gold_fingers,
      tantalum: result.components.tantalum,
      transformers: result.components.transformers,
      connectors: result.components.connectors,
      relays: result.components.relays,
      oscillators: result.components.oscillators,
    },
  
    recycling: {
      goldPotential: result.recycling.gold,
      silverPotential: result.recycling.silver,
      palladiumPotential: result.recycling.palladium,
      copperPotential: result.recycling.copper,
      overallPotential: result.recycling.commercial_grade,
    },
  
    engineering: {
      density: result.engineering.density,
      estimatedLayers: result.engineering.estimated_layers,
      technology: result.engineering.technology,
    },
  
    physicalState: result.engineering.condition,
  });
  const boardFamily = mapBoardTypeToFamily(
    result.identification.board_type,
    result.identification.probable_name,
    result.identification.equipment,
  );
  
  const benchmark = boardFamily
    ? validateEcoScoreBenchmark(
        boardFamily,
        ecoScore.score,
      )
    : null;
  const components = [
    ['CPU', result.components.cpu],
    ['FPGA', result.components.fpga],
    ['ASIC', result.components.asic],
    ['BGA', result.components.bga],
    ['Memórias', result.components.memory],
    ['Gold Fingers', result.components.gold_fingers],
    ['Tântalo', result.components.tantalum],
    ['Transformadores', result.components.transformers],
    ['Conectores', result.components.connectors],
    ['Relés', result.components.relays],
    ['Osciladores', result.components.oscillators],
  ];

  function EcoScoreMetric({
    label,
    value,
    max,
  }: {
    label: string;
    value: number;
    max: number;
  }) {
    const percentage = Math.max(
      0,
      Math.min(100, (value / max) * 100),
    );
  
    return (
      <div className="rounded-xl border border-white/10 bg-black/10 p-4">
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/35">
            {label}
          </p>
  
          <p className="whitespace-nowrap text-sm font-semibold text-white">
            {value}
            <span className="text-white/25">
              /{max}
            </span>
          </p>
        </div>
  
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full bg-emerald-400 transition-all duration-500"
            style={{
              width: `${percentage}%`,
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-emerald-400/20 bg-white/[0.035]">
      <div className="border-b border-white/10 px-6 py-6 sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400">
          Laudo técnico-comercial
        </p>

        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-semibold">
              {result.identification.probable_name}
            </h2>

            <p className="mt-2 text-sm text-white/45">
              {result.identification.board_type}
            </p>
          </div>

          <div className="min-w-40 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-5 py-3">
  <p className="text-xs uppercase tracking-[0.14em] text-emerald-300/70">
    EcoScore
  </p>

  <div className="mt-1 flex items-end gap-3">
    <p className="text-3xl font-semibold text-emerald-300">
      {ecoScore.score}
    </p>

    <span className="mb-1 rounded-md border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 text-xs font-semibold text-emerald-300">
      Classe {ecoScore.grade}
    </span>
  </div>

  <p className="mt-2 max-w-48 text-xs leading-5 text-white/40">
    {ecoScore.classification}
  </p>
</div>
        </div>
      </div>

      <div className="grid gap-4 border-b border-white/10 p-6 sm:grid-cols-2 sm:p-8">
        <img
          src={frontPreview}
          alt="Frente analisada"
          className="h-72 w-full rounded-2xl border border-white/10 bg-black/20 object-contain"
        />

        <img
          src={backPreview}
          alt="Verso analisado"
          className="h-72 w-full rounded-2xl border border-white/10 bg-black/20 object-contain"
        />
      </div>

        <ReportSection title="Identificação">
        <ReportGrid
          items={[
            ['Tipo', result.identification.board_type],
            ['Nome provável', result.identification.probable_name],
            ['Fabricante', result.identification.manufacturer],
            ['Modelo', result.identification.model],
            ['Part number', result.identification.part_number],
            ['Equipamento', result.identification.equipment],
            ['Função', result.identification.application],
            [
              'Confiança',
              formatPercentage(result.identification.confidence),
            ],
          ]}
        />
      </ReportSection>

      <ReportSection title="Características técnicas">
        <ReportGrid
          items={[
            ['Tecnologia', result.engineering.technology],
            [
              'Camadas estimadas',
              String(result.engineering.estimated_layers),
            ],
            ['Densidade', result.engineering.density],
            ['Condição', result.engineering.condition],
            [
              'Integridade',
              formatPercentage(result.engineering.integrity),
            ],
          ]}
        />
      </ReportSection>

      <ReportSection title="Componentes relevantes">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {components.map(([label, value]) => (
            <div
              key={String(label)}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 py-3"
            >
              <span className="text-sm text-white/50">
                {label}
              </span>

              <span className="text-lg font-semibold text-emerald-300">
                {value}
              </span>
            </div>
          ))}
        </div>
      </ReportSection>

      <ReportSection title="Potencial para reciclagem">
        <ReportGrid
          items={[
            [
              'Classe comercial',
              result.recycling.commercial_grade,
            ],
            ['Ouro', formatPotential(result.recycling.gold)],
            ['Prata', formatPotential(result.recycling.silver)],
            [
              'Paládio',
              formatPotential(result.recycling.palladium),
            ],
            ['Cobre', formatPotential(result.recycling.copper)],
            [
              'Confiança geral',
              formatPercentage(result.analysis.confidence),
            ],
          ]}
        />
      </ReportSection>

      <section className="border-t border-white/10 px-6 py-8 sm:px-8">
  <div className="flex flex-col gap-6">
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300/60">
        Composição do EcoScore
      </p>

      <div className="mt-3 flex flex-wrap items-end gap-3">
        <p className="text-3xl font-semibold text-white">
          {ecoScore.score}
          <span className="text-base font-medium text-white/30">
            /100
          </span>
        </p>

        <span className="mb-1 rounded-md border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-xs font-semibold text-emerald-300">
          Classe {ecoScore.grade}
        </span>
      </div>

      <p className="mt-2 text-sm text-white/45">
        {ecoScore.classification}
      </p>
    </div>

    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <EcoScoreMetric
        label="Potencial eletrônico"
        value={ecoScore.breakdown.electronicPotential}
        max={35}
      />

      <EcoScoreMetric
        label="Contatos e interfaces"
        value={ecoScore.breakdown.contactsAndInterfaces}
        max={20}
      />

      <EcoScoreMetric
        label="Potencial metalúrgico"
        value={ecoScore.breakdown.metallurgicalPotential}
        max={30}
      />

      <EcoScoreMetric
        label="Características da PCB"
        value={ecoScore.breakdown.pcbCharacteristics}
        max={15}
      />
    </div>

    {benchmark && (
  <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/35">
          Benchmark EcoBoard
        </p>

        <p className="mt-2 text-sm font-semibold text-white">
          {formatBenchmarkStatus(benchmark.status)}
        </p>

        <p className="mt-1 text-xs leading-5 text-white/35">
          {benchmark.message}
        </p>
      </div>

      <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06] px-4 py-3 text-right">
        <p className="text-[10px] uppercase tracking-[0.14em] text-emerald-300/60">
          Faixa de referência
        </p>

        <p className="mt-1 text-lg font-semibold text-emerald-300">
          {benchmark.expectedMin}
          {' – '}
          {benchmark.expectedMax}
        </p>
      </div>
    </div>

    {benchmark.differenceFromRange > 0 && (
      <p className="mt-4 border-t border-white/10 pt-4 text-xs leading-5 text-white/30">
        Diferença em relação à faixa esperada:{' '}
        <span className="font-semibold text-white/50">
          {benchmark.differenceFromRange}{' '}
          {benchmark.differenceFromRange === 1
            ? 'ponto'
            : 'pontos'}
        </span>
      </p>
    )}
  </div>
)}

    {ecoScore.breakdown.physicalAdjustment !== 0 && (
      <div className="rounded-xl border border-amber-400/15 bg-amber-400/[0.04] px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/40">
              Ajuste de integridade
            </p>

            <p className="mt-1 text-xs leading-5 text-white/35">
              Ajuste aplicado por danos, canibalização ou remoção de componentes.
            </p>
          </div>

          <p className="text-lg font-semibold text-amber-300">
            {ecoScore.breakdown.physicalAdjustment}
          </p>
        </div>
      </div>
    )}

    <p className="text-xs leading-5 text-white/30">
      O EcoScore representa o potencial relativo de recuperação da PCB.
      A pontuação não corresponde diretamente ao preço de compra ou venda.
    </p>
  </div>
</section>

      <ReportSection title="Parecer da EcoBoard">
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">
            {formatDecision(result.recommendation.decision)}
          </p>

          <p className="mt-4 text-sm leading-7 text-white/60">
            {result.recommendation.reason}
          </p>
        </div>
      </ReportSection>

      <div className="flex justify-end border-t border-white/10 p-6 sm:p-8">
        <button
          type="button"
          onClick={onReset}
          className="rounded-xl bg-emerald-400 px-6 py-3 text-sm font-semibold text-[#07110d] hover:bg-emerald-300"
        >
          Analisar outra placa
        </button>
      </div>
    </section>
  );
}

function ReportSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-white/10 p-6 sm:p-8">
      <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/40">
        {title}
      </h3>

      <div className="mt-5">{children}</div>
    </section>
  );
}

function ReportGrid({
  items,
}: {
  items: Array<[string, string]>;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map(([label, value]) => (
        <div
          key={label}
          className="rounded-2xl border border-white/10 bg-black/20 p-4"
        >
          <p className="text-[10px] uppercase tracking-[0.14em] text-white/30">
            {label}
          </p>

          <p className="mt-2 break-words text-base font-semibold">
            {value || 'Não identificado'}
          </p>
        </div>
      ))}
    </div>
  );
}

function formatPercentage(value: number): string {
  const percentage = value <= 1 ? value * 100 : value;
  const safeValue = Math.max(0, Math.min(percentage, 100));

  return `${Math.round(safeValue)}%`;
}

function formatPotential(value: string): string {
  const values: Record<string, string> = {
    VERY_LOW: 'Muito baixo',
    LOW: 'Baixo',
    MEDIUM: 'Médio',
    HIGH: 'Alto',
    VERY_HIGH: 'Muito alto',
  };

  return values[value] ?? value;
}



function formatDecision(value: string): string {
  const values: Record<string, string> = {
    BUY: 'Compra recomendada',
    NEGOTIATE: 'Negociar',
    DO_NOT_BUY: 'Compra não recomendada',
  };

  return values[value] ?? value;
}