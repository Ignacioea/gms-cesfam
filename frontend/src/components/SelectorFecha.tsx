// frontend/src/components/SelectorFecha.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface SelectorFechaProps {
  value: string; // formato "YYYY-MM-DD" o ""
  onChange: (fecha: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DIAS_SEMANA = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

export default function SelectorFecha({
  value,
  onChange,
  label,
  placeholder = 'Seleccionar fecha...',
  className = ''
}: SelectorFechaProps) {
  const [abierto, setAbierto] = useState(false);
  const contenedorRef = useRef<HTMLDivElement>(null);

  // Parsear fecha actual o fecha por defecto (hoy)
  const hoy = new Date();
  const fechaSeleccionada = value ? new Date(value + 'T00:00:00') : null;

  const [mesVista, setMesVista] = useState(fechaSeleccionada ? fechaSeleccionada.getMonth() : hoy.getMonth());
  const [anioVista, setAnioVista] = useState(fechaSeleccionada ? fechaSeleccionada.getFullYear() : hoy.getFullYear());

  // Sincronizar vista si cambia el valor externo
  useEffect(() => {
    if (value) {
      const f = new Date(value + 'T00:00:00');
      if (!isNaN(f.getTime())) {
        setMesVista(f.getMonth());
        setAnioVista(f.getFullYear());
      }
    }
  }, [value]);

  // Cerrar al hacer clic fuera del popover
  useEffect(() => {
    const handleClickFuera = (e: MouseEvent) => {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    };
    if (abierto) {
      document.addEventListener('mousedown', handleClickFuera);
    }
    return () => document.removeEventListener('mousedown', handleClickFuera);
  }, [abierto]);

  // Navegación de meses
  const irMesAnterior = () => {
    if (mesVista === 0) {
      setMesVista(11);
      setAnioVista(anioVista - 1);
    } else {
      setMesVista(mesVista - 1);
    }
  };

  const irMesSiguiente = () => {
    if (mesVista === 11) {
      setMesVista(0);
      setAnioVista(anioVista + 1);
    } else {
      setMesVista(mesVista + 1);
    }
  };

  // Calcular cuadrícula del mes
  const primerDiaSemana = (new Date(anioVista, mesVista, 1).getDay() + 6) % 7; // Lunes = 0
  const totalDiasMes = new Date(anioVista, mesVista + 1, 0).getDate();

  const seleccionarDia = (dia: number) => {
    const mesStr = String(mesVista + 1).padStart(2, '0');
    const diaStr = String(dia).padStart(2, '0');
    onChange(`${anioVista}-${mesStr}-${diaStr}`);
    setAbierto(false);
  };

  const seleccionarHoy = () => {
    const y = hoy.getFullYear();
    const m = String(hoy.getMonth() + 1).padStart(2, '0');
    const d = String(hoy.getDate()).padStart(2, '0');
    onChange(`${y}-${m}-${d}`);
    setMesVista(hoy.getMonth());
    setAnioVista(y);
    setAbierto(false);
  };

  const limpiarFecha = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  // Formatear texto visible del botón
  const formatearFechaDisplay = (isoStr: string) => {
    if (!isoStr) return placeholder;
    const partes = isoStr.split('-');
    if (partes.length === 3) {
      const [y, m, d] = partes;
      return `${d}/${m}/${y}`;
    }
    return isoStr;
  };

  // Rango de años para el selector (2020 a 2030)
  const aniosDisponibles = Array.from({ length: 11 }, (_, i) => 2020 + i);

  return (
    <div className={`relative inline-block ${className}`} ref={contenedorRef}>
      {label && (
        <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
          {label}
        </label>
      )}

      {/* Botón que simula el input y abre el calendario cuadrado */}
      <button
        type="button"
        onClick={() => setAbierto(!abierto)}
        className="flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 hover:bg-white text-xs font-semibold text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-900 transition cursor-pointer min-w-[155px]"
      >
        <span className="flex items-center gap-2 truncate">
          <CalendarIcon size={15} className="text-blue-900 shrink-0" />
          <span className={value ? 'text-slate-900 font-bold' : 'text-slate-400 font-normal'}>
            {formatearFechaDisplay(value)}
          </span>
        </span>

        {value && (
          <span 
            onClick={limpiarFecha}
            className="p-0.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition cursor-pointer shrink-0"
            title="Borrar fecha"
          >
            <X size={13} />
          </span>
        )}
      </button>

      {/* POPUP / CUADRO DEL CALENDARIO */}
      {abierto && (
        <div className="absolute z-50 mt-1.5 p-4 bg-white rounded-2xl shadow-2xl border border-slate-200 w-72 text-slate-800 animate-in fade-in zoom-in-95 duration-150">
          
          {/* Cabecera del Calendario: Selectores de Mes y Año con Flechas */}
          <div className="flex items-center justify-between gap-1 mb-3 pb-2 border-b border-slate-100">
            <button
              type="button"
              onClick={irMesAnterior}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition cursor-pointer"
              title="Mes anterior"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="flex items-center gap-1.5">
              {/* Selector de Mes */}
              <select
                value={mesVista}
                onChange={(e) => setMesVista(Number(e.target.value))}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-900 cursor-pointer"
              >
                {MESES.map((nombreMes, idx) => (
                  <option key={nombreMes} value={idx}>{nombreMes}</option>
                ))}
              </select>

              {/* Selector de Año */}
              <select
                value={anioVista}
                onChange={(e) => setAnioVista(Number(e.target.value))}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-900 cursor-pointer"
              >
                {aniosDisponibles.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={irMesSiguiente}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition cursor-pointer"
              title="Mes siguiente"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Días de la semana */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {DIAS_SEMANA.map((d) => (
              <span key={d} className="text-[11px] font-bold text-slate-400 py-1">
                {d}
              </span>
            ))}
          </div>

          {/* Cuadrícula de días del mes */}
          <div className="grid grid-cols-7 gap-1">
            {/* Espacios vacíos antes del primer día */}
            {Array.from({ length: primerDiaSemana }).map((_, i) => (
              <div key={`vacio-${i}`} className="h-8" />
            ))}

            {/* Días del mes */}
            {Array.from({ length: totalDiasMes }).map((_, i) => {
              const dia = i + 1;
              const esSeleccionado = fechaSeleccionada &&
                fechaSeleccionada.getFullYear() === anioVista &&
                fechaSeleccionada.getMonth() === mesVista &&
                fechaSeleccionada.getDate() === dia;

              const esHoy = hoy.getFullYear() === anioVista &&
                hoy.getMonth() === mesVista &&
                hoy.getDate() === dia;

              return (
                <button
                  key={dia}
                  type="button"
                  onClick={() => seleccionarDia(dia)}
                  className={`h-8 w-8 text-xs font-semibold rounded-xl flex items-center justify-center transition cursor-pointer ${
                    esSeleccionado
                      ? 'bg-blue-950 text-white font-bold shadow-md'
                      : esHoy
                      ? 'bg-blue-50 text-blue-950 font-bold border border-blue-200 hover:bg-blue-100'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  {dia}
                </button>
              );
            })}
          </div>

          {/* Pie del Calendario: Acciones Rápidas */}
          <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-100 text-[11px] font-bold">
            <button
              type="button"
              onClick={seleccionarHoy}
              className="text-blue-900 hover:underline cursor-pointer"
            >
              Hoy
            </button>
            {value && (
              <button
                type="button"
                onClick={() => { onChange(''); setAbierto(false); }}
                className="text-rose-600 hover:underline cursor-pointer"
              >
                Borrar selección
              </button>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
