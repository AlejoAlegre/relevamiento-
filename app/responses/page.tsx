import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import DeleteButton from './DeleteButton';

const QUESTION_LABELS: Record<string, string> = {
  area: 'Área',
  estructura: 'Tipo de bodega',
  procesos_tiempo: 'Procesos que consumen tiempo',
  manual_excel: 'Procesos manuales / Excel',
  medicion: 'Qué les gustaría medir mejor',
  dificultad: 'Área con mayor dificultad',
  impacto: 'Impacto principal',
  impacto_otra: 'Impacto (otro)',
  prioridad: 'Prioridad de resolución',
  frecuencia: 'Frecuencia de la dificultad',
  herramientas: 'Herramientas actuales',
  mejora: 'Tipo de mejora más útil',
  mejora_otra: 'Mejora (otro)',
  resolver_primero: 'Qué resolver primero',
  resolver_primero_otra: 'Qué resolver primero (otro)',
  interes: 'Interés en solución',
  contacto: 'Contacto',
};

type Row = {
  id: number;
  submitted_at: string;
  data: Record<string, string | string[]>;
};

async function getResponses(): Promise<Row[]> {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );
  const { data, error } = await supabase
    .from('responses')
    .select('*')
    .order('submitted_at', { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }
  return data ?? [];
}

function formatValue(value: string | string[]): string {
  if (Array.isArray(value)) return value.join(', ');
  return String(value);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const revalidate = 0;

export default async function ResponsesPage() {
  const responses = await getResponses();

  return (
    <div className="min-h-screen bg-[#f6f1ea] text-stone-900">
      <header className="border-b border-stone-200 bg-gradient-to-b from-[#2b1616] to-[#4a2727] text-white">
        <div className="mx-auto max-w-6xl px-6 py-10 md:px-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.22em] text-stone-300">Panel de administración</p>
              <h1 className="text-2xl font-semibold md:text-3xl">Respuestas del relevamiento</h1>
              <p className="mt-2 text-sm text-stone-300">
                {responses.length === 0
                  ? 'Todavía no hay respuestas registradas.'
                  : `${responses.length} respuesta${responses.length !== 1 ? 's' : ''} registrada${responses.length !== 1 ? 's' : ''}`}
              </p>
            </div>
            <Link
              href="/"
              className="shrink-0 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/20"
            >
              Ver formulario
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10 md:px-10">
        {responses.length === 0 ? (
          <div className="rounded-3xl border border-stone-200 bg-white p-12 text-center shadow-sm">
            <p className="text-stone-500">Aún no se recibieron respuestas.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {responses.map((resp) => (
              <div
                key={resp.id}
                className="rounded-3xl border border-stone-200 bg-white shadow-sm overflow-hidden"
              >
                <div className="flex items-center justify-between border-b border-stone-100 bg-stone-50 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-900 text-xs font-medium text-white">
                      #
                    </div>
                    <span className="text-sm font-medium text-stone-700">
                      {resp.data?.contacto ? String(resp.data.contacto) : 'Anónimo'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-stone-400">{formatDate(resp.submitted_at)}</span>
                    <DeleteButton id={resp.id} />
                  </div>
                </div>

                <div className="divide-y divide-stone-100">
                  {Object.entries(QUESTION_LABELS).map(([key, label]) => {
                    const value = resp.data?.[key];
                    if (!value || (Array.isArray(value) && value.length === 0)) return null;
                    return (
                      <div key={key} className="grid grid-cols-1 gap-1 px-6 py-4 md:grid-cols-3">
                        <dt className="text-xs font-medium uppercase tracking-wide text-stone-400">{label}</dt>
                        <dd className="text-sm text-stone-800 md:col-span-2">{formatValue(value)}</dd>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
