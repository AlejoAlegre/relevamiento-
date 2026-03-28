'use client';

import { useState, FormEvent } from 'react';

const questions = [
  {
    id: 'area',
    label: '¿Qué área describe mejor su función o el área desde la que responde?',
    type: 'radio',
    options: [
      'Dirección / Gerencia',
      'Administración / Finanzas',
      'Comercial / Ventas',
      'Turismo / Hospitalidad',
      'Operaciones / Producción',
      'Logística',
      'Otra',
    ],
  },
  {
    id: 'estructura',
    label: '¿En qué tipo de bodega o estructura se desempeñan?',
    type: 'radio',
    options: [
      'Bodega pequeña',
      'Bodega mediana',
      'Bodega grande',
      'Emprendimiento familiar / boutique',
      'Otro',
    ],
  },
  {
    id: 'procesos_tiempo',
    label: '¿Qué procesos o tareas de gestión les consumen hoy más tiempo del que deberían?',
    type: 'checkbox',
    options: [
      'Armado de reportes',
      'Seguimiento comercial / clientes',
      'Carga o consolidación de datos',
      'Control administrativo',
      'Organización de información en Excel',
      'Seguimiento de cobranzas / pagos',
      'Coordinación interna entre áreas',
      'Medición de indicadores',
      'Otro',
    ],
  },
  {
    id: 'manual_excel',
    label: '¿Qué procesos manejan hoy de forma manual o con muchas intervenciones en Excel o planillas?',
    type: 'textarea',
    placeholder: 'Describa brevemente...',
  },
  {
    id: 'medicion',
    label: '¿Hay algún proceso, indicador o resultado que les gustaría medir mejor y hoy no pueden visualizar con claridad?',
    type: 'textarea',
    placeholder: 'Describa brevemente...',
  },
  {
    id: 'dificultad',
    label: '¿En qué área sienten hoy mayor dificultad de seguimiento, control o visibilidad?',
    type: 'radio',
    options: [
      'Ventas / Comercial',
      'Administración',
      'Cobranzas',
      'Turismo / reservas / visitas',
      'Stock / insumos',
      'Producción / operaciones',
      'Atención al cliente',
      'Reportes e indicadores',
      'Otra',
    ],
  },
  {
    id: 'herramientas',
    label: '¿Con qué herramientas gestionan hoy esa información?',
    type: 'checkbox',
    options: [
      'Excel',
      'Google Sheets',
      'Sistema propio',
      'ERP',
      'CRM',
      'WhatsApp',
      'Formularios',
      'Registros manuales',
      'Otra',
    ],
  },
  {
    id: 'mejora',
    label: '¿Qué tipo de mejora les resultaría más útil hoy?',
    type: 'checkbox',
    options: [
      'Tableros de control e indicadores',
      'Automatización de planillas y reportes',
      'Mejor organización de datos',
      'Seguimiento comercial / clientes',
      'Alertas o recordatorios automáticos',
      'Reportes más rápidos y claros',
      'Centralización de información',
      'Otro',
    ],
  },
  {
    id: 'interes',
    label: 'Si existiera una solución simple para ordenar, medir o automatizar alguno de estos procesos, ¿les interesaría evaluarla?',
    type: 'radio',
    options: ['Sí', 'Tal vez', 'No por el momento'],
  },
  {
    id: 'contacto',
    label: 'Si desean que les compartamos una devolución breve con oportunidades detectadas, pueden dejar su contacto.',
    type: 'text',
    placeholder: 'Nombre, cargo y medio de contacto (opcional)',
  },
];

type FormValues = Record<string, string | string[]>;

export default function BodegasSurveyPage() {
  const [values, setValues] = useState<FormValues>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleRadio = (id: string, value: string) => {
    setValues((prev) => ({ ...prev, [id]: value }));
  };

  const handleCheckbox = (id: string, value: string, checked: boolean) => {
    setValues((prev) => {
      const current = (prev[id] as string[]) || [];
      return {
        ...prev,
        [id]: checked ? [...current, value] : current.filter((v) => v !== value),
      };
    });
  };

  const handleText = (id: string, value: string) => {
    setValues((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error('Error en la respuesta');
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  const renderQuestion = (q: (typeof questions)[number]) => {
    if (q.type === 'radio') {
      return (
        <div className="space-y-3">
          {q.options!.map((option) => (
            <label
              key={option}
              className="flex items-center gap-3 rounded-xl border border-stone-200 p-3 hover:bg-stone-50 transition cursor-pointer"
            >
              <input
                type="radio"
                name={q.id}
                value={option}
                checked={(values[q.id] as string) === option}
                onChange={() => handleRadio(q.id, option)}
                className="h-4 w-4 accent-stone-900"
              />
              <span className="text-sm text-stone-700">{option}</span>
            </label>
          ))}
        </div>
      );
    }

    if (q.type === 'checkbox') {
      const selected = (values[q.id] as string[]) || [];
      return (
        <div className="space-y-3">
          {q.options!.map((option) => (
            <label
              key={option}
              className="flex items-center gap-3 rounded-xl border border-stone-200 p-3 hover:bg-stone-50 transition cursor-pointer"
            >
              <input
                type="checkbox"
                name={q.id}
                value={option}
                checked={selected.includes(option)}
                onChange={(e) => handleCheckbox(q.id, option, e.target.checked)}
                className="h-4 w-4 accent-stone-900"
              />
              <span className="text-sm text-stone-700">{option}</span>
            </label>
          ))}
        </div>
      );
    }

    if (q.type === 'textarea') {
      return (
        <textarea
          name={q.id}
          placeholder={q.placeholder}
          rows={5}
          value={(values[q.id] as string) || ''}
          onChange={(e) => handleText(q.id, e.target.value)}
          className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-800 shadow-sm outline-none transition focus:border-stone-400"
        />
      );
    }

    return (
      <input
        type="text"
        name={q.id}
        placeholder={q.placeholder}
        value={(values[q.id] as string) || ''}
        onChange={(e) => handleText(q.id, e.target.value)}
        className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-800 shadow-sm outline-none transition focus:border-stone-400"
      />
    );
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-[#f6f1ea] flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-3xl border border-stone-200 bg-white p-10 shadow-sm text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-stone-900 text-white text-2xl">
            ✓
          </div>
          <h2 className="text-2xl font-semibold text-stone-900">¡Gracias por participar!</h2>
          <p className="mt-4 text-sm leading-7 text-stone-600">
            Tus respuestas fueron registradas. En caso de haber dejado contacto, te enviaremos una
            devolución con las oportunidades detectadas.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f1ea] text-stone-900">
      <section className="relative overflow-hidden border-b border-stone-200 bg-gradient-to-b from-[#2b1616] to-[#4a2727] text-white">
        <div className="mx-auto max-w-5xl px-6 py-16 md:px-10 md:py-20">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm uppercase tracking-[0.22em] text-stone-300">Relevamiento sectorial</p>
            <h1 className="text-3xl font-semibold leading-tight md:text-5xl">
              Relevamiento sobre procesos de gestión en bodegas
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-stone-200 md:text-base">
              Este relevamiento busca identificar cuellos de botella en la gestión diaria de bodegas,
              especialmente en tareas manuales, seguimiento de información, reportes y procesos difíciles de medir.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur-sm">
                <div className="text-xs uppercase tracking-wide text-stone-300">Objetivo</div>
                <div className="mt-2 text-sm text-white">
                  Detectar oportunidades concretas de mejora en organización, control y automatización.
                </div>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur-sm">
                <div className="text-xs uppercase tracking-wide text-stone-300">Duración</div>
                <div className="mt-2 text-sm text-white">Menos de 5 minutos.</div>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur-sm">
                <div className="text-xs uppercase tracking-wide text-stone-300">Enfoque</div>
                <div className="mt-2 text-sm text-white">
                  Problemas reales de operación, seguimiento y medición.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-4xl px-6 py-10 md:px-10 md:py-14">
        <div className="mb-8 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-xl font-semibold">Introducción</h2>
          <p className="mt-4 text-sm leading-7 text-stone-600">
            La información relevada será utilizada únicamente con fines de análisis y detección de
            oportunidades de mejora. En caso de interés, podrá compartirse una devolución breve con
            observaciones generales y posibles líneas de mejora.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {questions.map((q, index) => (
            <section
              key={q.id}
              className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm md:p-8"
            >
              <div className="mb-5 flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stone-900 text-sm font-medium text-white">
                  {index + 1}
                </div>
                <h3 className="text-base font-medium leading-6 text-stone-900">{q.label}</h3>
              </div>
              {renderQuestion(q)}
            </section>
          ))}

          {status === 'error' && (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
              Hubo un error al enviar. Por favor intentá de nuevo.
            </p>
          )}

          <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-lg font-semibold">Enviar respuestas</h3>
                <p className="mt-2 text-sm text-stone-600">
                  Tus respuestas quedan guardadas de forma privada.
                </p>
              </div>
              <button
                type="submit"
                disabled={status === 'sending'}
                className="rounded-2xl bg-stone-900 px-6 py-3 text-sm font-medium text-white shadow-sm transition hover:opacity-90 disabled:opacity-50"
              >
                {status === 'sending' ? 'Enviando...' : 'Enviar formulario'}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
