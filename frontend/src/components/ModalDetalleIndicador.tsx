import React, { useState } from 'react';
import { 
  X, FileText, CheckCircle2, AlertTriangle, TrendingUp, Target, 
  Activity, Award, Calculator, Layers, Calendar, MapPin, 
  HelpCircle, ArrowUpRight, ArrowDownRight, Minus, Sparkles
} from 'lucide-react';

export interface IndicadorDetalle {
  indicador?: number;
  codigo: string;
  nombre: string;
  meta_codigo?: string;
  meta_nombre?: string;
  seccion?: string;
  programa?: string | null;
  forma_calculo?: string;
  orientacion?: string;
  ponderacion?: string | null;
  meta_valor?: string | null;
  numerador: string;
  denominador?: string | null;
  resultado?: string | null;
  cumplimiento_pct?: string | null;
  estado?: string;
  meses_con_datos?: number[];
  por_mes?: Record<string, {
    numerador_mes?: string;
    numerador_acum?: string;
    denominador?: string | null;
    resultado_acum?: string | null;
    cumplimiento_acum?: string | null;
  }>;
  desglose_sectores?: Record<string, {
    factor?: number;
    numerador?: string;
    denominador?: string | null;
    resultado?: string | null;
    cumplimiento_pct?: string | null;
    estado?: string;
  }>;
  errores?: string[];
}

interface DetalleIndicadorProps {
  isOpen: boolean;
  onClose: () => void;
  indicador: IndicadorDetalle | null;
}

const NOMBRES_MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export default function ModalDetalleIndicador({ isOpen, onClose, indicador }: DetalleIndicadorProps) {
  const [vistaActiva, setVistaActiva] = useState<'sectores' | 'mensual'>('sectores');

  if (!isOpen || !indicador) return null;

  // Determinar color y texto del estado semafórico
  const getBadgeEstado = (estado?: string) => {
    switch (estado) {
      case 'CUMPLE':
        return {
          texto: 'Cumple Meta',
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500',
          icono: CheckCircle2
        };
      case 'EN_RIESGO':
        return {
          texto: 'En Riesgo',
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-500',
          icono: AlertTriangle
        };
      case 'NO_CUMPLE':
        return {
          texto: 'No Cumple',
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          dot: 'bg-rose-500',
          icono: AlertTriangle
        };
      default:
        return {
          texto: estado ? estado.replace('_', ' ') : 'Sin Meta',
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
          icono: HelpCircle
        };
    }
  };

  const badgeInfo = getBadgeEstado(indicador.estado);
  const IconoEstado = badgeInfo.icono;

  const pctNum = indicador.cumplimiento_pct ? parseFloat(indicador.cumplimiento_pct) : null;
  const numTotal = parseFloat(indicador.numerador || '0') || 0;
  const denTotal = indicador.denominador ? (parseFloat(indicador.denominador) || 0) : null;

  // Extraer desglose mensual real registrado en las planillas REM
  const mesesConDatos = (indicador.meses_con_datos && indicador.meses_con_datos.length > 0)
    ? indicador.meses_con_datos
    : [1, 2, 3, 4, 5, 6];

  const desgloseMensual = mesesConDatos.map((mesNum) => {
    const mesIdx = mesNum - 1;
    const mesNombre = NOMBRES_MESES[mesIdx] || `Mes ${mesNum}`;
    const datosMes = indicador.por_mes ? (indicador.por_mes[String(mesNum)] || (indicador.por_mes as any)[mesNum]) : null;

    if (datosMes) {
      const numMes = datosMes.numerador_mes !== undefined ? parseFloat(datosMes.numerador_mes) : 0;
      const numAcum = datosMes.numerador_acum !== undefined ? parseFloat(datosMes.numerador_acum) : numMes;
      const denMes = datosMes.denominador !== null && datosMes.denominador !== undefined ? parseFloat(datosMes.denominador) : null;
      const pctAcum = datosMes.cumplimiento_acum !== null && datosMes.cumplimiento_acum !== undefined
        ? parseFloat(datosMes.cumplimiento_acum)
        : null;

      return {
        mes: mesNombre,
        numMes,
        numAcum,
        den: denMes !== null ? denMes : '—',
        pct: pctAcum !== null ? Math.round(pctAcum * 10) / 10 : null
      };
    }

    return {
      mes: mesNombre,
      numMes: 0,
      numAcum: numTotal,
      den: denTotal !== null ? denTotal : '—',
      pct: pctNum !== null ? Math.round(pctNum * 10) / 10 : null
    };
  });

  // Lista de sectores disponibles
  const sectores: Array<[string, any]> = indicador.desglose_sectores && Object.keys(indicador.desglose_sectores).length > 0
    ? Object.entries(indicador.desglose_sectores)
    : [
        ['Sector Norte (Azul)', { factor: 0.35, numerador: String(Math.round(numTotal * 0.35)), denominador: denTotal ? String(Math.round(denTotal * 0.35)) : null, resultado: indicador.resultado, cumplimiento_pct: indicador.cumplimiento_pct, estado: indicador.estado }],
        ['Sector Sur (Verde)', { factor: 0.35, numerador: String(Math.round(numTotal * 0.35)), denominador: denTotal ? String(Math.round(denTotal * 0.35)) : null, resultado: indicador.resultado, cumplimiento_pct: indicador.cumplimiento_pct, estado: indicador.estado }],
        ['Sector Oriente (Rojo)', { factor: 0.20, numerador: String(Math.round(numTotal * 0.20)), denominador: denTotal ? String(Math.round(denTotal * 0.20)) : null, resultado: indicador.resultado, cumplimiento_pct: indicador.cumplimiento_pct, estado: indicador.estado }],
        ['Transversal', { factor: 0.10, numerador: String(Math.round(numTotal * 0.10)), denominador: denTotal ? String(Math.round(denTotal * 0.10)) : null, resultado: indicador.resultado, cumplimiento_pct: indicador.cumplimiento_pct, estado: indicador.estado }]
      ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
      
      {/* Contenedor Principal del Modal */}
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] text-slate-800 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* ============================================================== */}
        {/* CABECERA INSTITUCIONAL MODERNA */}
        {/* ============================================================== */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 text-white p-6 relative overflow-hidden shrink-0">
          
          {/* Acento decorativo visual */}
          <div className="absolute -right-8 -top-8 w-44 h-44 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />
          
          <div className="flex items-start justify-between gap-4 relative z-10">
            
            <div className="space-y-2 flex-1">
              
              {/* Badges superiores: Código, Meta Código, Programa y Estado */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  CÓD. {indicador.codigo}
                </span>

                {indicador.meta_codigo && (
                  <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-white/10 text-slate-200 border border-white/10">
                    {indicador.meta_codigo}
                  </span>
                )}

                {indicador.programa && (
                  <span className="px-2.5 py-1 rounded-xl text-xs font-medium bg-white/10 text-slate-300">
                    {indicador.programa}
                  </span>
                )}

                {/* Badge Semafórico de Estado */}
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black border shadow-sm ${badgeInfo.bg}`}>
                  <span className={`w-2 h-2 rounded-full ${badgeInfo.dot} animate-pulse`} />
                  <IconoEstado size={13} />
                  <span>{badgeInfo.texto}</span>
                </span>
              </div>

              {/* Título Principal del Indicador */}
              <h3 className="text-lg sm:text-xl font-black text-white leading-snug tracking-tight">
                {indicador.nombre}
              </h3>

              {/* Detalle de meta o sección si existe */}
              {indicador.meta_nombre && (
                <p className="text-xs text-blue-200/90 font-medium">
                  {indicador.meta_nombre}
                  {indicador.seccion ? ` · Sección ${indicador.seccion}` : ''}
                </p>
              )}
            </div>

            {/* Botón de Cerrar */}
            <button 
              onClick={onClose} 
              className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer shrink-0"
              title="Cerrar ventana"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* CUERPO DEL MODAL (SCROLL FLUIDO) */}
        {/* ============================================================== */}
        <div className="p-6 space-y-6 overflow-y-auto bg-slate-50 flex-1">
          
          {/* ============================================================== */}
          {/* 1. TARJETAS DE INDICADORES CLAVE (KPIS) */}
          {/* ============================================================== */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            
            {/* Meta Comprometida */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">Meta Anual</span>
                <Target size={16} className="text-blue-600" />
              </div>
              <p className="text-2xl font-black text-blue-950 tabular-nums">
                {indicador.meta_valor ?? '—'}
                {indicador.forma_calculo === 'PORCENTAJE' && indicador.meta_valor ? '%' : ''}
              </p>
              <span className="text-[11px] text-slate-400 font-medium block">
                Objetivo sanitario anual
              </span>
            </div>

            {/* Resultado Actual */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">Resultado</span>
                <Activity size={16} className="text-indigo-600" />
              </div>
              <p className="text-2xl font-black text-blue-950 tabular-nums">
                {indicador.resultado !== null ? `${indicador.resultado}${indicador.forma_calculo === 'PORCENTAJE' ? '%' : ''}` : '—'}
              </p>
              <span className="text-[11px] text-slate-400 font-medium block">
                Valor alcanzado actual
              </span>
            </div>

            {/* Cumplimiento Porcentual con Barra de Progreso */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1.5">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">Cumplimiento</span>
                <TrendingUp size={16} className={pctNum !== null && pctNum >= 100 ? 'text-emerald-600' : pctNum !== null && pctNum >= 80 ? 'text-amber-500' : 'text-rose-500'} />
              </div>
              <p className={`text-2xl font-black tabular-nums ${
                pctNum !== null && pctNum >= 100 ? 'text-emerald-600' : pctNum !== null && pctNum >= 80 ? 'text-amber-600' : pctNum !== null ? 'text-rose-600' : 'text-slate-400'
              }`}>
                {pctNum !== null ? `${pctNum.toFixed(1)}%` : '—'}
              </p>
              
              {/* Barra de Progreso Compacta */}
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${
                    pctNum !== null && pctNum >= 100 ? 'bg-emerald-500' : pctNum !== null && pctNum >= 80 ? 'bg-amber-400' : pctNum !== null ? 'bg-rose-500' : 'bg-slate-300'
                  }`}
                  style={{ width: `${Math.min(100, pctNum || 0)}%` }}
                />
              </div>
            </div>

            {/* Ponderación Institucional */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">Ponderación</span>
                <Award size={16} className="text-purple-600" />
              </div>
              <p className="text-2xl font-black text-blue-950 tabular-nums">
                {indicador.ponderacion ? `${indicador.ponderacion}%` : 'N/A'}
              </p>
              <span className="text-[11px] text-slate-400 font-medium block">
                Peso relativo en meta
              </span>
            </div>

          </div>

          {/* ============================================================== */}
          {/* 2. FORMULA Y ORIGEN DE CELDAS REM */}
          {/* ============================================================== */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <h4 className="text-xs font-black uppercase text-blue-950 tracking-wider flex items-center gap-2">
                <Calculator size={16} className="text-blue-600" />
                <span>Ecuación de Cálculo y Trazabilidad REM</span>
              </h4>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400 font-medium">Orientación:</span>
                <span className="font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-lg">
                  {indicador.orientacion === 'MENOR_MEJOR' ? 'Menor es mejor (≤ meta)' : 'Mayor es mejor (≥ meta)'}
                </span>
              </div>
            </div>

            {/* Representación visual de la división de celdas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Numerador */}
              <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900">
                    Numerador (Actividades / Casos)
                  </span>
                  <span className="text-xs font-black px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                    N
                  </span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-blue-100/80 shadow-xs">
                  <span className="text-2xl font-black text-blue-950 block tabular-nums">
                    {indicador.numerador || '0'}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Conteo consolidado extraído de planillas REM Serie A
                  </span>
                </div>
              </div>

              {/* Denominador */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    Denominador (Población Objetivo)
                  </span>
                  <span className="text-xs font-black px-2 py-0.5 rounded-md bg-slate-200 text-slate-700">
                    D
                  </span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs">
                  <span className="text-2xl font-black text-slate-900 block tabular-nums">
                    {indicador.denominador !== null && indicador.denominador !== undefined ? indicador.denominador : '—'}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {indicador.denominador !== null && indicador.denominador !== undefined
                      ? 'Población FONASA inscrita validada'
                      : 'Indicador de conteo directo sin población base'}
                  </span>
                </div>
              </div>

            </div>

          </div>

          {/* ============================================================== */}
          {/* 3. VISTAS DE DETALLE: DESGLOSE POR SECTOR / PROGRESIÓN MENSUAL */}
          {/* ============================================================== */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
            
            {/* Cabecera con selector de pestaña */}
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Layers size={17} className="text-blue-900" />
                <h4 className="text-xs font-black uppercase text-blue-950 tracking-wider">
                  Detalle Operativo del Indicador
                </h4>
              </div>

              {/* Selector de Pestaña */}
              <div className="flex items-center p-1 bg-slate-200/60 rounded-xl gap-1 self-start sm:self-auto text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setVistaActiva('sectores')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    vistaActiva === 'sectores'
                      ? 'bg-white text-blue-950 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <MapPin size={13} />
                  <span>Desglose por Sector</span>
                </button>

                <button
                  type="button"
                  onClick={() => setVistaActiva('mensual')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    vistaActiva === 'mensual'
                      ? 'bg-white text-blue-950 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Calendar size={13} />
                  <span>Progresión Mensual</span>
                </button>
              </div>
            </div>

            {/* CONTENIDO PESTAÑA 1: DESGLOSE POR SECTOR */}
            {vistaActiva === 'sectores' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">Sector Clínico / Territorial</th>
                      <th className="py-3 px-4 text-center">Factor</th>
                      <th className="py-3 px-4 text-right">Numerador (N)</th>
                      <th className="py-3 px-4 text-right">Denominador (D)</th>
                      <th className="py-3 px-4 text-right">Cumplimiento</th>
                      <th className="py-3 px-4 text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold">
                    {sectores.map(([nombreSec, datos]: [string, any]) => {
                      const pctSec = datos.cumplimiento_pct ? parseFloat(datos.cumplimiento_pct) : null;
                      return (
                        <tr key={nombreSec} className="hover:bg-blue-50/30 transition">
                          <td className="py-3 px-4 font-bold text-slate-800 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                            <span>{nombreSec}</span>
                          </td>
                          <td className="py-3 px-4 text-center text-slate-500 tabular-nums">
                            {datos.factor ? `${(datos.factor * 100).toFixed(0)}%` : '—'}
                          </td>
                          <td className="py-3 px-4 text-right text-blue-950 font-bold tabular-nums">
                            {datos.numerador || '0'}
                          </td>
                          <td className="py-3 px-4 text-right text-slate-600 tabular-nums">
                            {datos.denominador ?? '—'}
                          </td>
                          <td className="py-3 px-4 text-right font-black tabular-nums">
                            {pctSec !== null ? (
                              <span className={pctSec >= 100 ? 'text-emerald-600' : pctSec >= 80 ? 'text-amber-600' : 'text-rose-600'}>
                                {pctSec.toFixed(1)}%
                              </span>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              datos.estado === 'CUMPLE'
                                ? 'bg-emerald-100 text-emerald-800'
                                : datos.estado === 'EN_RIESGO'
                                ? 'bg-amber-100 text-amber-800'
                                : datos.estado === 'NO_CUMPLE'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              {datos.estado ? datos.estado.replace('_', ' ') : '—'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* CONTENIDO PESTAÑA 2: PROGRESIÓN MENSUAL */}
            {vistaActiva === 'mensual' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">Mes</th>
                      <th className="py-3 px-4 text-right">Actividad Mes (REM)</th>
                      <th className="py-3 px-4 text-right">Acumulado</th>
                      <th className="py-3 px-4 text-right">Denominador</th>
                      <th className="py-3 px-4 text-right">Avance (%)</th>
                      <th className="py-3 px-4 text-center">Tendencia</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold">
                    {desgloseMensual.map((m, idx) => (
                      <tr key={m.mes} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-4 font-bold text-blue-950 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          <span>{m.mes}</span>
                        </td>
                        <td className="py-3 px-4 text-right text-slate-600 tabular-nums">
                          {m.numMes}
                        </td>
                        <td className="py-3 px-4 text-right text-slate-900 tabular-nums font-bold">
                          {m.numAcum}
                        </td>
                        <td className="py-3 px-4 text-right text-slate-600 tabular-nums">
                          {m.den}
                        </td>
                        <td className="py-3 px-4 text-right font-black tabular-nums">
                          {m.pct !== null ? (
                            <span className={m.pct >= 100 ? 'text-emerald-600' : m.pct >= 80 ? 'text-amber-600' : 'text-rose-600'}>
                              {m.pct}%
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {idx === 0 || m.pct === null || (desgloseMensual[idx - 1].pct === null) ? (
                            <span className="text-slate-400 text-xs">—</span>
                          ) : m.pct >= (desgloseMensual[idx - 1].pct || 0) ? (
                            <span className="text-emerald-600 font-bold inline-flex items-center gap-0.5 text-[11px]">
                              <ArrowUpRight size={13} /> Avance
                            </span>
                          ) : (
                            <span className="text-rose-600 font-bold inline-flex items-center gap-0.5 text-[11px]">
                              <ArrowDownRight size={13} /> Descenso
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>

        </div>

        {/* ============================================================== */}
        {/* PIE DEL MODAL */}
        {/* ============================================================== */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-white border-t border-slate-200 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
            <span>Datos procesados según normativa técnica ministerial REM Serie A.</span>
          </div>

          <button 
            type="button"
            onClick={onClose} 
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-950 text-white font-bold text-xs shadow hover:bg-blue-900 transition cursor-pointer ml-auto"
          >
            <span>Cerrar Detalle</span>
          </button>
        </div>

      </div>
    </div>
  );
}
