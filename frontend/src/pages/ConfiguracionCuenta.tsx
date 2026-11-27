// frontend/src/pages/ConfiguracionCuenta.tsx
import React, { useState, useEffect } from 'react';
import { 
  User, Lock, Save, AlertCircle, CheckCircle2, ShieldCheck, 
  Key, Eye, EyeOff, ShieldAlert, Building2, Mail, 
  BadgeCheck, Clock, RefreshCw, Activity, ArrowRight, Laptop, Info
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

interface DatosUsuario {
  id: number;
  rut: string;
  nombres: string;
  apellidos: string;
  email: string;
  rol?: number | string;
  rol_nombre?: string;
  rol_detalle?: {
    id: number;
    nombre_rol: string;
    descripcion: string;
  };
}

export default function ConfiguracionCuenta() {
  const userRut = localStorage.getItem('user_rut') || '11111111-1';
  const initialName = localStorage.getItem('user_name') || 'Carmen Valdés';
  const rawRole = localStorage.getItem('user_role') || 'Directora';
  const userRole = (!rawRole || !isNaN(Number(rawRole))) ? 'Directora' : rawRole;

  // Estados de perfil
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [rut, setRut] = useState(userRut);
  const [email, setEmail] = useState('');
  const [rolNombre, setRolNombre] = useState(userRole);
  const [rolDescripcion, setRolDescripcion] = useState('');

  // Estados de contraseña
  const [passwordActual, setPasswordActual] = useState('');
  const [passwordNueva, setPasswordNueva] = useState('');
  const [passwordConfirmar, setPasswordConfirmar] = useState('');
  const [mostrarPasswordActual, setMostrarPasswordActual] = useState(false);
  const [mostrarPasswordNueva, setMostrarPasswordNueva] = useState(false);

  // Estados de feedback y UI
  const [mensaje, setMensaje] = useState<{ texto: string; tipo: 'exito' | 'error' | '' }>({ texto: '', tipo: '' });
  const [cargando, setCargando] = useState(false);
  const [cargandoDatos, setCargandoDatos] = useState(true);

  // Foto de perfil según rol
  const fotoPorDefecto = String(rolNombre).toLowerCase().includes('jefe')
    ? 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=250'
    : 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=250';

  const userPhoto = localStorage.getItem('user_photo') || fotoPorDefecto;

  // Cargar datos reales desde la API de PostgreSQL
  const cargarPerfil = async () => {
    setCargandoDatos(true);
    try {
      const res = await api.get('usuarios/mi_perfil/');
      const data: DatosUsuario = res.data;
      setNombres(data.nombres || '');
      setApellidos(data.apellidos || '');
      setRut(data.rut || userRut);
      setEmail(data.email || `${data.rut ? data.rut.split('-')[0] : 'usuario'}@salud.cl`);
      
      const rolStr = data.rol_nombre || data.rol_detalle?.nombre_rol || (typeof data.rol === 'string' && isNaN(Number(data.rol)) ? data.rol : userRole);
      setRolNombre(String(rolStr || 'Directora'));

      const rolDesc = data.rol_detalle?.descripcion || 'Usuario autorizado del CESFAM Santa Rosa';
      setRolDescripcion(String(rolDesc));

      if (rolStr && isNaN(Number(rolStr))) {
        localStorage.setItem('user_role', String(rolStr));
      }
      localStorage.setItem('user_name', `${data.nombres || ''} ${data.apellidos || ''}`.trim() || initialName);
    } catch {
      // Fallback a valores por defecto si ocurre desconexión o falta token
      const partes = initialName.split(' ');
      setNombres(partes[0] || initialName);
      setApellidos(partes.slice(1).join(' ') || '');
      setEmail(localStorage.getItem('user_email') || 'carmen.valdes@salud.cl');
      setRolNombre(userRole);
      setRolDescripcion('Usuario autorizado del CESFAM Santa Rosa');
    } finally {
      setCargandoDatos(false);
    }
  };

  useEffect(() => {
    cargarPerfil();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Validación de seguridad de contraseña
  const tieneMinCaracteres = passwordNueva.length >= 6;
  const tieneNumero = /\d/.test(passwordNueva);
  const tieneLetra = /[a-zA-Z]/.test(passwordNueva);
  const coincidenContrasenas = passwordNueva !== '' && passwordNueva === passwordConfirmar;

  // Guardar cambios de contraseña (datos personales son de solo lectura)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje({ texto: '', tipo: '' });

    if (!passwordActual) {
      setMensaje({ texto: 'Debe ingresar su contraseña actual para confirmar el cambio.', tipo: 'error' });
      return;
    }
    if (!passwordNueva) {
      setMensaje({ texto: 'Debe ingresar la nueva contraseña.', tipo: 'error' });
      return;
    }
    if (!passwordConfirmar) {
      setMensaje({ texto: 'Debe confirmar su nueva contraseña.', tipo: 'error' });
      return;
    }
    if (!coincidenContrasenas) {
      setMensaje({ texto: 'La nueva contraseña y su confirmación no coinciden.', tipo: 'error' });
      return;
    }
    if (!tieneMinCaracteres) {
      setMensaje({ texto: 'La nueva contraseña debe tener al menos 6 caracteres.', tipo: 'error' });
      return;
    }

    setCargando(true);
    try {
      const payload: Record<string, any> = {
        password_actual: passwordActual,
        password_nueva: passwordNueva,
      };

      const res = await api.put('usuarios/mi_perfil/', payload);
      
      setMensaje({ 
        texto: res.data.mensaje || 'Contraseña actualizada exitosamente.', 
        tipo: 'exito' 
      });
      setPasswordActual('');
      setPasswordNueva('');
      setPasswordConfirmar('');
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.response?.data?.detail || 'No se pudo actualizar la contraseña. Verifique su contraseña actual.';
      setMensaje({ texto: errorMsg, tipo: 'error' });
    } finally {
      setCargando(false);
    }
  };

  // Badge de color por rol
  const getBadgeColorRol = (rol: any) => {
    const rolStr = String(rol || '').toLowerCase();
    switch (rolStr) {
      case 'directora':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'subdireccion':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'gestor':
      case 'administrador':
        return 'bg-purple-100 text-purple-900 border-purple-300';
      case 'jefeprograma':
      case 'jefe de programa':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="w-full min-h-full bg-slate-50 p-6 md:p-8 space-y-6">
      
      {/* 1. HERO HEADER DE PERFIL INSTITUCIONAL */}
      <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 rounded-3xl p-6 md:p-8 text-white shadow-lg border border-blue-900/50 relative overflow-hidden">
        {/* Efecto decorativo de fondo */}
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 -mb-10 w-60 h-60 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            {/* Avatar del usuario */}
            <div className="relative shrink-0">
              <img 
                src={userPhoto} 
                alt="Perfil" 
                className="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-cover border-4 border-white/20 shadow-xl bg-blue-900"
              />
              <span className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-emerald-500 border-2 border-blue-950 flex items-center justify-center text-white" title="Cuenta Activa">
                <BadgeCheck size={14} />
              </span>
            </div>

            {/* Información rápida */}
            <div className="space-y-1">
              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">
                {cargandoDatos ? 'Cargando perfil...' : `${nombres} ${apellidos}`.trim() || initialName}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 font-medium pt-1">
                <span className="flex items-center gap-1.5">
                  <User size={14} className="text-blue-400" /> RUT: <strong className="text-white font-mono">{rut}</strong>
                </span>
                <span className="flex items-center gap-1.5">
                  <Mail size={14} className="text-blue-400" /> {email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Building2 size={14} className="text-blue-400" /> CESFAM Santa Rosa
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={cargarPerfil}
              disabled={cargandoDatos}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl font-bold text-xs transition border border-white/10 cursor-pointer backdrop-blur-sm"
              title="Refrescar datos"
            >
              <RefreshCw size={15} className={cargandoDatos ? 'animate-spin' : ''} />
              Refrescar
            </button>
          </div>
        </div>
      </div>

      {/* Alerta de Mensaje de Retroalimentación */}
      {mensaje.texto && (
        <div className={`p-4 rounded-2xl border text-sm font-semibold flex items-center justify-between gap-3 shadow-sm transition-all ${
          mensaje.tipo === 'exito' 
            ? 'bg-emerald-50 text-emerald-900 border-emerald-200' 
            : 'bg-rose-50 text-rose-900 border-rose-200'
        }`}>
          <div className="flex items-center gap-2.5">
            {mensaje.tipo === 'exito' ? (
              <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle size={20} className="text-rose-600 shrink-0" />
            )}
            <span>{mensaje.texto}</span>
          </div>
          <button 
            onClick={() => setMensaje({ texto: '', tipo: '' })}
            className="text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* 2. GRID PRINCIPAL: FORMULARIO (2 COLUMNAS) + PANELES DE SEGURIDAD (1 COLUMNA) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUMNA IZQUIERDA: FORMULARIOS DE PERFIL Y SEGURIDAD */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* TARJETA 1: DATOS PERSONALES Y PROFESIONALES (SOLO LECTURA) */}
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200 space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-50 text-blue-900 font-bold">
                    <User size={18} />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-blue-950">Información del Funcionario</h4>
                    <p className="text-xs text-slate-500 font-medium">Datos personales e identificación oficial en el CESFAM (solo lectura).</p>
                  </div>
                </div>
              </div>

              {/* Nota informativa de datos protegidos */}
              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 font-medium">
                <Info size={16} className="text-blue-600 shrink-0" />
                <span>
                  Por políticas de seguridad y trazabilidad asistencial, sus datos personales (nombre, apellido, RUT y correo) son de <strong>solo lectura</strong>. Para solicitar modificaciones, contacte al Gestor institucional.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Nombres
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      disabled
                      value={nombres}
                      className="w-full rounded-xl border border-slate-200 p-3 text-sm font-semibold text-slate-600 bg-slate-100 cursor-not-allowed"
                    />
                    <Lock size={15} className="absolute right-3.5 top-3.5 text-slate-400" />
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block font-medium">
                    Nombre oficial registrado en el sistema.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Apellidos
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      disabled
                      value={apellidos}
                      className="w-full rounded-xl border border-slate-200 p-3 text-sm font-semibold text-slate-600 bg-slate-100 cursor-not-allowed"
                    />
                    <Lock size={15} className="absolute right-3.5 top-3.5 text-slate-400" />
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block font-medium">
                    Apellido oficial registrado en el sistema.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    RUT Institucional (Identificador)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      disabled
                      value={rut}
                      className="w-full rounded-xl border border-slate-200 p-3 text-sm font-bold font-mono text-slate-500 bg-slate-100 cursor-not-allowed"
                    />
                    <Lock size={15} className="absolute right-3.5 top-3.5 text-slate-400" />
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block font-medium">
                    El RUT es inmutable y está vinculado a su ficha funcionaria.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Correo Electrónico
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      disabled
                      value={email}
                      className="w-full rounded-xl border border-slate-200 p-3 text-sm font-semibold text-slate-500 bg-slate-100 cursor-not-allowed"
                    />
                    <Mail size={15} className="absolute right-3.5 top-3.5 text-slate-400" />
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block font-medium">
                    Dirección institucional para trazabilidad y notificaciones.
                  </span>
                </div>
              </div>
            </div>

            {/* TARJETA 2: CREDENCIALES Y CAMBIO DE CONTRASEÑA */}
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200 space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-900 font-bold">
                    <Key size={18} />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-blue-950">Seguridad y Credenciales de Acceso</h4>
                    <p className="text-xs text-slate-500 font-medium">
                      Actualice su contraseña periódicamente para proteger los registros de salud del CESFAM.
                    </p>
                  </div>
                </div>
              </div>

              {/* Contraseña Actual */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Contraseña Actual
                </label>
                <div className="relative max-w-md">
                  <input
                    type={mostrarPasswordActual ? 'text' : 'password'}
                    value={passwordActual}
                    onChange={(e) => setPasswordActual(e.target.value)}
                    placeholder="Ingrese su clave actual para aplicar cambios..."
                    className="w-full rounded-xl border border-slate-300 p-3 pr-11 text-sm text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-900 transition font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarPasswordActual(!mostrarPasswordActual)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                  >
                    {mostrarPasswordActual ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Requerida únicamente si va a cambiar su contraseña de acceso.
                </span>
              </div>

              {/* Nuevas Contraseñas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Nueva Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={mostrarPasswordNueva ? 'text' : 'password'}
                      value={passwordNueva}
                      onChange={(e) => setPasswordNueva(e.target.value)}
                      placeholder="Mínimo 6 caracteres..."
                      className="w-full rounded-xl border border-slate-300 p-3 pr-11 text-sm text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-900 transition font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarPasswordNueva(!mostrarPasswordNueva)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                    >
                      {mostrarPasswordNueva ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Confirmar Nueva Contraseña
                  </label>
                  <input
                    type={mostrarPasswordNueva ? 'text' : 'password'}
                    value={passwordConfirmar}
                    onChange={(e) => setPasswordConfirmar(e.target.value)}
                    placeholder="Repita la nueva contraseña..."
                    className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-900 transition font-mono"
                  />
                </div>
              </div>

              {/* Indicadores de Fortaleza de Contraseña */}
              {passwordNueva && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block">
                    Requisitos de Seguridad de Contraseña:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className={`flex items-center gap-1.5 font-semibold ${tieneMinCaracteres ? 'text-emerald-700' : 'text-slate-400'}`}>
                      <CheckCircle2 size={14} className={tieneMinCaracteres ? 'text-emerald-600' : 'text-slate-300'} />
                      <span>Al menos 6 caracteres</span>
                    </div>
                    <div className={`flex items-center gap-1.5 font-semibold ${tieneNumero && tieneLetra ? 'text-emerald-700' : 'text-slate-400'}`}>
                      <CheckCircle2 size={14} className={tieneNumero && tieneLetra ? 'text-emerald-600' : 'text-slate-300'} />
                      <span>Letras y números</span>
                    </div>
                    <div className={`flex items-center gap-1.5 font-semibold ${coincidenContrasenas ? 'text-emerald-700' : 'text-slate-400'}`}>
                      <CheckCircle2 size={14} className={coincidenContrasenas ? 'text-emerald-600' : 'text-slate-300'} />
                      <span>Contraseñas coinciden</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* BOTONES DE ACCIÓN */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-3xl shadow-sm border border-slate-200">
              <span className="text-xs text-slate-500 font-medium">
                Toda modificación de contraseña quedará registrada en la bitácora oficial de auditoría.
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setPasswordActual('');
                    setPasswordNueva('');
                    setPasswordConfirmar('');
                    setMensaje({ texto: '', tipo: '' });
                  }}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  Limpiar Campos
                </button>
                <button
                  type="submit"
                  disabled={cargando || !passwordActual || !passwordNueva || !passwordConfirmar}
                  className="flex items-center gap-2 bg-blue-950 hover:bg-blue-900 text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-md transition cursor-pointer disabled:opacity-50"
                >
                  {cargando ? (
                    <>
                      <RefreshCw size={15} className="animate-spin" />
                      <span>Actualizando contraseña...</span>
                    </>
                  ) : (
                    <>
                      <Key size={15} />
                      <span>Actualizar Contraseña</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </form>
        </div>

        {/* COLUMNA DERECHA: PANELES DE ROL, SEGURIDAD Y PRIVILEGIOS */}
        <div className="space-y-6">
          
          {/* TARJETA: PERMISOS Y ALCANCE SEGÚN ROL */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-900 font-bold">
                <ShieldCheck size={18} className="text-blue-700" />
              </div>
              <div>
                <h4 className="text-sm font-black text-blue-950">Privilegios y Alcance del Rol</h4>
                <p className="text-[11px] text-slate-400 font-medium">Nivel de autorización y módulos habilitados</p>
              </div>
            </div>

            {/* Cuadro destacado de Rol Vigente */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Rol Vigente</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  <CheckCircle2 size={12} className="text-emerald-600" /> Autorizado
                </span>
              </div>
              <div>
                <span className={`inline-block px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wide border shadow-sm ${getBadgeColorRol(rolNombre)}`}>
                  {rolNombre}
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium leading-relaxed pt-1">
                {rolDescripcion || 'Funcionario acreditado con acceso a los módulos asistenciales del CESFAM Santa Rosa.'}
              </p>
            </div>

            {/* Listado estructurado de permisos del sistema */}
            <div className="space-y-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Permisos del Sistema
              </span>
              
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50/70 border border-slate-100 hover:bg-slate-50 transition text-xs font-semibold text-slate-700">
                  <div className="p-1 rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
                    <CheckCircle2 size={13} />
                  </div>
                  <span>Acceso al Dashboard de Gestión y Semáforos</span>
                </div>

                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50/70 border border-slate-100 hover:bg-slate-50 transition text-xs font-semibold text-slate-700">
                  <div className="p-1 rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
                    <CheckCircle2 size={13} />
                  </div>
                  <span>Cálculo en vivo de metas e indicadores IAAPS</span>
                </div>
                
                {(rolNombre === 'Directora' || rolNombre === 'Subdireccion' || rolNombre === 'Gestor') && (
                  <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50/70 border border-slate-100 hover:bg-slate-50 transition text-xs font-semibold text-slate-700">
                    <div className="p-1 rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
                      <CheckCircle2 size={13} />
                    </div>
                    <span>Reporte Comparativo Histórico e Interanual</span>
                  </div>
                )}

                {(rolNombre === 'Gestor' || rolNombre === 'Subdireccion' || rolNombre === 'Directora') && (
                  <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50/70 border border-slate-100 hover:bg-slate-50 transition text-xs font-semibold text-slate-700">
                    <div className="p-1 rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
                      <CheckCircle2 size={13} />
                    </div>
                    <span>Bitácora de Auditoría y Trazabilidad</span>
                  </div>
                )}

                {(rolNombre === 'Gestor' || rolNombre === 'Subdireccion') && (
                  <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50/70 border border-slate-100 hover:bg-slate-50 transition text-xs font-semibold text-slate-700">
                    <div className="p-1 rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
                      <CheckCircle2 size={13} />
                    </div>
                    <span>Carga y Validación de Planillas REM Serie A</span>
                  </div>
                )}

                {rolNombre === 'Gestor' && (
                  <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50/70 border border-slate-100 hover:bg-slate-50 transition text-xs font-semibold text-slate-700">
                    <div className="p-1 rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
                      <CheckCircle2 size={13} />
                    </div>
                    <span>Administración de Usuarios y Perfiles del CESFAM</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* TARJETA: SESIÓN Y TRAZABILIDAD */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-950 uppercase tracking-wider pb-2 border-b border-slate-100">
              <Laptop size={16} className="text-indigo-600" />
              <span>Sesión y Seguridad de Acceso</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="font-bold text-slate-700 block">Tipo de Token</span>
                  <span className="text-[11px] text-slate-400 font-mono">SimpleJWT (Bearer)</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Válido
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="font-bold text-slate-700 block">Identificación de Red</span>
                  <span className="text-[11px] text-slate-400 font-mono">127.0.0.1 / Red Salud</span>
                </div>
                <Activity size={15} className="text-blue-600" />
              </div>

              <div className="p-3 rounded-2xl bg-blue-50/60 border border-blue-200 text-blue-950 space-y-1">
                <span className="font-black text-xs flex items-center gap-1.5">
                  <ShieldAlert size={14} className="text-blue-700" />
                  Política de Seguridad CESFAM
                </span>
                <p className="text-[11px] text-blue-900/80 leading-relaxed font-medium">
                  Cierre siempre su sesión al abandonar su estación de trabajo clínica para evitar accesos no autorizados a datos sensibles de pacientes.
                </p>
              </div>

              {(rolNombre === 'Gestor' || rolNombre === 'Directora' || rolNombre === 'Subdireccion') && (
                <Link
                  to="/audit"
                  className="flex items-center justify-between w-full p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 font-bold text-blue-950 transition cursor-pointer mt-2"
                >
                  <span className="flex items-center gap-2">
                    <Clock size={14} className="text-blue-600" />
                    <span>Ver Mis Acciones en Auditoría</span>
                  </span>
                  <ArrowRight size={14} />
                </Link>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
