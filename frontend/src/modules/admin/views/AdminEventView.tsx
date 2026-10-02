import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAdminEvent } from '../hooks/useAdminEvent';
import { resolveEventImageUrl } from '../../events/utils/eventImageResolver';

interface SlotState {
  file: File | null;
  preview: string | null;
  markedForRemoval: boolean;
  ratioInfo: string | null;
  ratioWarning: string | null;
}

export function AdminEventView() {
  const {
    event,
    loading,
    error,
    saving,
    deleting,
    actionError,
    uploadEvent,
    deleteEvent,
  } = useAdminEvent();

  const [title, setTitle] = useState('');

  // Estados de los 3 slots de imagen
  const [squareSlot, setSquareSlot] = useState<SlotState>({
    file: null,
    preview: null,
    markedForRemoval: false,
    ratioInfo: null,
    ratioWarning: null,
  });

  const [verticalSlot, setVerticalSlot] = useState<SlotState>({
    file: null,
    preview: null,
    markedForRemoval: false,
    ratioInfo: null,
    ratioWarning: null,
  });

  const [bannerSlot, setBannerSlot] = useState<SlotState>({
    file: null,
    preview: null,
    markedForRemoval: false,
    ratioInfo: null,
    ratioWarning: null,
  });

  const squareInputRef = useRef<HTMLInputElement>(null);
  const verticalInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Inicializar o sincronizar el título con el evento existente
  useEffect(() => {
    if (event) {
      setTitle(event.title || '');
    }
  }, [event]);

  // Validador de proporción de aspecto
  const analyzeImageFile = (
    file: File,
    type: 'square' | 'vertical' | 'banner',
  ): Promise<{ info: string; warning: string | null }> => {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        const w = img.width;
        const h = img.height;
        const ratio = w / h;
        const info = `${w} × ${h} px`;
        let warning: string | null = null;

        if (type === 'square') {
          if (ratio < 0.75 || ratio > 1.3) {
            warning = `Proporción no cuadrada (${ratio.toFixed(2)}:1). Recomendado ~1:1.`;
          }
        } else if (type === 'vertical') {
          if (ratio > 0.85) {
            warning = `La imagen no parece vertical (${ratio.toFixed(2)}:1). Recomendado ~9:16 (0.56:1).`;
          }
        } else if (type === 'banner') {
          if (ratio < 1.25) {
            warning = `La imagen no parece horizontal (${ratio.toFixed(2)}:1). Recomendado formato banner/apaisado (~16:9).`;
          }
        }

        resolve({ info, warning });
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve({ info: 'Imagen válida', warning: null });
      };
      img.src = url;
    });
  };

  const handleFileSelect = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'square' | 'vertical' | 'banner',
  ) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.type.match(/^image\/(jpeg|png|webp)$/)) {
      alert('Solo se permiten imágenes en formato JPG, PNG o WEBP');
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      alert('La imagen no puede pesar más de 5 MB');
      return;
    }

    const { info, warning } = await analyzeImageFile(selectedFile, type);
    const objectUrl = URL.createObjectURL(selectedFile);

    if (type === 'square') {
      setSquareSlot({
        file: selectedFile,
        preview: objectUrl,
        markedForRemoval: false,
        ratioInfo: info,
        ratioWarning: warning,
      });
    } else if (type === 'vertical') {
      setVerticalSlot({
        file: selectedFile,
        preview: objectUrl,
        markedForRemoval: false,
        ratioInfo: info,
        ratioWarning: warning,
      });
    } else if (type === 'banner') {
      setBannerSlot({
        file: selectedFile,
        preview: objectUrl,
        markedForRemoval: false,
        ratioInfo: info,
        ratioWarning: warning,
      });
    }
  };

  const handleRemoveSlot = (type: 'square' | 'vertical' | 'banner') => {
    if (type === 'square') {
      setSquareSlot({
        file: null,
        preview: null,
        markedForRemoval: Boolean(event?.imageUrlSquare),
        ratioInfo: null,
        ratioWarning: null,
      });
      if (squareInputRef.current) squareInputRef.current.value = '';
    } else if (type === 'vertical') {
      setVerticalSlot({
        file: null,
        preview: null,
        markedForRemoval: Boolean(event?.imageUrlVertical),
        ratioInfo: null,
        ratioWarning: null,
      });
      if (verticalInputRef.current) verticalInputRef.current.value = '';
    } else if (type === 'banner') {
      setBannerSlot({
        file: null,
        preview: null,
        markedForRemoval: Boolean(event?.imageUrlBanner),
        ratioInfo: null,
        ratioWarning: null,
      });
      if (bannerInputRef.current) bannerInputRef.current.value = '';
    }
  };

  const handleResetForm = () => {
    setTitle(event?.title || '');
    setSquareSlot({ file: null, preview: null, markedForRemoval: false, ratioInfo: null, ratioWarning: null });
    setVerticalSlot({ file: null, preview: null, markedForRemoval: false, ratioInfo: null, ratioWarning: null });
    setBannerSlot({ file: null, preview: null, markedForRemoval: false, ratioInfo: null, ratioWarning: null });
    if (squareInputRef.current) squareInputRef.current.value = '';
    if (verticalInputRef.current) verticalInputRef.current.value = '';
    if (bannerInputRef.current) bannerInputRef.current.value = '';
  };

  // Determinar si hay al menos una imagen disponible (existente que no se marcó para borrar, o nueva)
  const hasSquareAvailable = (!squareSlot.markedForRemoval && (squareSlot.file || event?.imageUrlSquare));
  const hasVerticalAvailable = (!verticalSlot.markedForRemoval && (verticalSlot.file || event?.imageUrlVertical));
  const hasBannerAvailable = (!bannerSlot.markedForRemoval && (bannerSlot.file || event?.imageUrlBanner));
  const hasLegacyAvailable = Boolean(event?.imageUrl);
  const hasAtLeastOneImage = hasSquareAvailable || hasVerticalAvailable || hasBannerAvailable || hasLegacyAvailable;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('Debes ingresar un título para el evento.');
      return;
    }

    if (!hasAtLeastOneImage) {
      alert('Debes cargar al menos una imagen (cuadrada, vertical o horizontal/banner).');
      return;
    }

    const success = await uploadEvent({
      title: title.trim(),
      imageSquare: squareSlot.file,
      imageVertical: verticalSlot.file,
      imageBanner: bannerSlot.file,
      removeSquare: squareSlot.markedForRemoval,
      removeVertical: verticalSlot.markedForRemoval,
      removeBanner: bannerSlot.markedForRemoval,
    });

    if (success) {
      // Limpiar archivos locales recién subidos
      setSquareSlot({ file: null, preview: null, markedForRemoval: false, ratioInfo: null, ratioWarning: null });
      setVerticalSlot({ file: null, preview: null, markedForRemoval: false, ratioInfo: null, ratioWarning: null });
      setBannerSlot({ file: null, preview: null, markedForRemoval: false, ratioInfo: null, ratioWarning: null });
      if (squareInputRef.current) squareInputRef.current.value = '';
      if (verticalInputRef.current) verticalInputRef.current.value = '';
      if (bannerInputRef.current) bannerInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-background text-text">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center p-4 justify-between w-full max-w-4xl mx-auto">
          <Link className="text-text flex size-10 shrink-0 items-center justify-center rounded-lg hover:bg-surface transition-colors" to="/dashboard">
            <span className="material-symbols-outlined">arrow_back_ios</span>
          </Link>
          <h1 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-10">
            Administración: Evento del mes
          </h1>
        </div>
      </header>

      <main className="w-full max-w-4xl mx-auto p-4 sm:p-6 pb-24 space-y-8">
        
        {loading ? (
          <div className="bg-surface p-8 rounded-2xl text-sm text-muted border border-border text-center shadow-soft animate-pulse">
            <span className="material-symbols-outlined text-3xl mb-2 animate-spin">sync</span>
            <p>Cargando información del evento actual...</p>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 p-5 rounded-2xl text-sm text-red-500 border border-red-500/20 text-center">
            {error}
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* SECCIÓN 1: EVENTO PUBLICADO ACTUALMENTE */}
            <section className="bg-surface rounded-2xl border border-border shadow-soft p-5 sm:p-6 space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-3 border-b border-border pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
                    <h2 className="text-xs uppercase tracking-[0.2em] text-primary font-bold">
                      Estado Actual
                    </h2>
                  </div>
                  <h3 className="text-xl font-bold mt-1">
                    {event ? event.title : 'No hay ningún evento activo'}
                  </h3>
                </div>

                {event && (
                  <button 
                    onClick={deleteEvent} 
                    disabled={deleting}
                    className="flex items-center gap-2 rounded-xl border border-red-200 dark:border-red-900/50 text-red-600 text-sm font-semibold px-4 py-2 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                    {deleting ? 'Eliminando...' : 'Eliminar Evento'}
                  </button>
                )}
              </div>

              {event ? (
                <div className="space-y-4">
                  <p className="text-xs text-muted">
                    Recursos visuales activos cargados en el servidor:
                  </p>
                  
                  {/* Grid de miniaturas del evento publicado */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Cuadrada */}
                    <div className="rounded-xl border border-border bg-background p-3 flex flex-col items-center">
                      <div className="flex items-center justify-between w-full mb-2">
                        <span className="text-xs font-bold text-muted">Cuadrada (1:1)</span>
                        {event.imageUrlSquare ? (
                          <span className="text-[10px] bg-emerald-500/10 text-emerald-600 font-bold px-2 py-0.5 rounded-full">Activa</span>
                        ) : (
                          <span className="text-[10px] bg-amber-500/10 text-amber-600 font-bold px-2 py-0.5 rounded-full">Fallback</span>
                        )}
                      </div>
                      <div className="size-32 rounded-lg overflow-hidden bg-neutral-900 flex items-center justify-center relative shadow-inner">
                        {resolveEventImageUrl(event, 'square') ? (
                          <img 
                            src={resolveEventImageUrl(event, 'square')!} 
                            alt="1:1" 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <span className="material-symbols-outlined text-muted">image_not_supported</span>
                        )}
                      </div>
                    </div>

                    {/* Vertical */}
                    <div className="rounded-xl border border-border bg-background p-3 flex flex-col items-center">
                      <div className="flex items-center justify-between w-full mb-2">
                        <span className="text-xs font-bold text-muted">Vertical (9:16)</span>
                        {event.imageUrlVertical ? (
                          <span className="text-[10px] bg-emerald-500/10 text-emerald-600 font-bold px-2 py-0.5 rounded-full">Activa</span>
                        ) : (
                          <span className="text-[10px] bg-amber-500/10 text-amber-600 font-bold px-2 py-0.5 rounded-full">Fallback</span>
                        )}
                      </div>
                      <div className="w-20 h-32 rounded-lg overflow-hidden bg-neutral-900 flex items-center justify-center relative shadow-inner">
                        {resolveEventImageUrl(event, 'mobile') ? (
                          <img 
                            src={resolveEventImageUrl(event, 'mobile')!} 
                            alt="9:16" 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <span className="material-symbols-outlined text-muted">image_not_supported</span>
                        )}
                      </div>
                    </div>

                    {/* Horizontal Banner */}
                    <div className="rounded-xl border border-border bg-background p-3 flex flex-col items-center">
                      <div className="flex items-center justify-between w-full mb-2">
                        <span className="text-xs font-bold text-muted">Horizontal (Banner)</span>
                        {event.imageUrlBanner ? (
                          <span className="text-[10px] bg-emerald-500/10 text-emerald-600 font-bold px-2 py-0.5 rounded-full">Activa</span>
                        ) : (
                          <span className="text-[10px] bg-amber-500/10 text-amber-600 font-bold px-2 py-0.5 rounded-full">Fallback</span>
                        )}
                      </div>
                      <div className="w-full h-32 rounded-lg overflow-hidden bg-neutral-900 flex items-center justify-center relative shadow-inner">
                        {resolveEventImageUrl(event, 'desktop') ? (
                          <img 
                            src={resolveEventImageUrl(event, 'desktop')!} 
                            alt="Banner" 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <span className="material-symbols-outlined text-muted">image_not_supported</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-muted">
                  <span className="material-symbols-outlined text-4xl mb-2 opacity-40">event_busy</span>
                  <p className="text-sm font-medium">No hay ningún evento del mes publicado actualmente.</p>
                </div>
              )}
            </section>

            {/* SECCIÓN 2: FORMULARIO DE CARGA Y ADMINISTRACIÓN DE LAS 3 IMÁGENES */}
            <section className="bg-surface rounded-2xl border border-border shadow-soft p-5 sm:p-6 space-y-6">
              <div className="border-b border-border pb-4">
                <h2 className="text-xs uppercase tracking-[0.2em] text-primary font-bold">
                  {event ? 'Editar o Reemplazar Evento' : 'Publicar Nuevo Evento'}
                </h2>
                <p className="text-sm text-muted mt-1">
                  Carga hasta 3 formatos de imagen diferentes. El sistema aplicará fallback inteligente si falta alguna.
                </p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {actionError && (
                  <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600 font-medium">
                    {actionError}
                  </div>
                )}
                
                {/* Título del evento */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-bold text-text">
                      Título del evento <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[11px] text-muted">{title.length} / 200</span>
                  </div>
                  <input 
                    type="text" 
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" 
                    placeholder="Ej: Torneo Nacional Clausura 2026" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    maxLength={200}
                    required 
                  />
                </div>

                {/* Nota informativa de fallback */}
                <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 text-xs text-muted flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5">info</span>
                  <p className="leading-relaxed">
                    <strong>Podes guardar con 1, 2 o las 3 imágenes:</strong> La aplicación elegirá en Desktop la imagen horizontal, en teléfonos la imagen vertical, y en tarjetas la imagen cuadrada. Si falta alguna, utilizará automáticamente la mejor disponible sin deformarla.
                  </p>
                </div>

                {/* Grid con los 3 slots de imagen */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  
                  {/* SLOT 1: IMAGEN CUADRADA (1:1) */}
                  <div className="rounded-2xl border border-border bg-background/50 p-4 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-text">Imagen cuadrada</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-primary/10 text-primary border border-primary/20">
                          1:1
                        </span>
                      </div>
                      <p className="text-[11px] text-muted leading-tight">
                        Para teléfonos, cards y espacios cuadrados
                      </p>
                    </div>

                    {/* Previsualizador */}
                    <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-neutral-900 border border-border flex items-center justify-center group shadow-inner">
                      {squareSlot.preview ? (
                        <img src={squareSlot.preview} alt="Vista previa cuadrada" className="w-full h-full object-cover" />
                      ) : (event?.imageUrlSquare && !squareSlot.markedForRemoval) ? (
                        <img src={event.imageUrlSquare} alt="Cuadrada guardada" className="w-full h-full object-cover" />
                      ) : (
                        <div 
                          className="flex flex-col items-center justify-center p-4 text-center cursor-pointer hover:bg-neutral-800/80 transition-colors w-full h-full text-muted"
                          onClick={() => squareInputRef.current?.click()}
                        >
                          <span className="material-symbols-outlined text-3xl mb-1 text-primary/70">crop_square</span>
                          <span className="text-xs font-semibold">Seleccionar 1:1</span>
                          <span className="text-[10px] opacity-75 mt-0.5">Ej: 1080 × 1080 px</span>
                        </div>
                      )}

                      {/* Botón flotante para cambiar */}
                      {(squareSlot.preview || (event?.imageUrlSquare && !squareSlot.markedForRemoval)) && (
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => squareInputRef.current?.click()}
                            className="bg-white/20 hover:bg-white/30 text-white rounded-lg px-2.5 py-1.5 text-xs font-bold backdrop-blur-md flex items-center gap-1 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                            Cambiar
                          </button>
                        </div>
                      )}

                      {squareSlot.markedForRemoval && (
                        <div className="absolute inset-0 bg-red-950/80 flex flex-col items-center justify-center text-red-300 p-2 text-center text-xs font-bold">
                          <span className="material-symbols-outlined text-2xl mb-1">delete</span>
                          Marcada para eliminar al guardar
                        </div>
                      )}
                    </div>

                    {/* Alertas de proporción / dimensiones */}
                    {squareSlot.ratioInfo && (
                      <div className="text-[10px] font-mono text-muted flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">straighten</span>
                        {squareSlot.ratioInfo}
                      </div>
                    )}
                    {squareSlot.ratioWarning && (
                      <div className="text-[11px] text-amber-600 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20 leading-tight">
                        {squareSlot.ratioWarning}
                      </div>
                    )}

                    {/* Acciones del Slot */}
                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => squareInputRef.current?.click()}
                        className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                      >
                        {(squareSlot.file || (event?.imageUrlSquare && !squareSlot.markedForRemoval)) ? 'Reemplazar' : '+ Subir imagen'}
                      </button>

                      {(squareSlot.file || (event?.imageUrlSquare && !squareSlot.markedForRemoval)) && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSlot('square')}
                          className="text-xs font-semibold text-red-500 hover:text-red-700 flex items-center gap-0.5 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[14px]">delete</span>
                          Quitar
                        </button>
                      )}
                    </div>

                    <input 
                      ref={squareInputRef} 
                      type="file" 
                      accept="image/jpeg, image/png, image/webp" 
                      className="hidden" 
                      onChange={(e) => handleFileSelect(e, 'square')} 
                    />
                  </div>

                  {/* SLOT 2: IMAGEN VERTICAL (9:16) */}
                  <div className="rounded-2xl border border-border bg-background/50 p-4 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-text">Imagen vertical</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-accent/10 text-accent border border-accent/20">
                          9:16
                        </span>
                      </div>
                      <p className="text-[11px] text-muted leading-tight">
                        Formato historia, teléfonos y pop-up vertical
                      </p>
                    </div>

                    {/* Previsualizador */}
                    <div className="relative aspect-[9/16] w-full max-h-[260px] mx-auto rounded-xl overflow-hidden bg-neutral-900 border border-border flex items-center justify-center group shadow-inner">
                      {verticalSlot.preview ? (
                        <img src={verticalSlot.preview} alt="Vista previa vertical" className="w-full h-full object-cover" />
                      ) : (event?.imageUrlVertical && !verticalSlot.markedForRemoval) ? (
                        <img src={event.imageUrlVertical} alt="Vertical guardada" className="w-full h-full object-cover" />
                      ) : (
                        <div 
                          className="flex flex-col items-center justify-center p-4 text-center cursor-pointer hover:bg-neutral-800/80 transition-colors w-full h-full text-muted"
                          onClick={() => verticalInputRef.current?.click()}
                        >
                          <span className="material-symbols-outlined text-3xl mb-1 text-accent/80">stay_current_portrait</span>
                          <span className="text-xs font-semibold">Seleccionar 9:16</span>
                          <span className="text-[10px] opacity-75 mt-0.5">Ej: 1080 × 1920 px</span>
                        </div>
                      )}

                      {/* Botón flotante para cambiar */}
                      {(verticalSlot.preview || (event?.imageUrlVertical && !verticalSlot.markedForRemoval)) && (
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => verticalInputRef.current?.click()}
                            className="bg-white/20 hover:bg-white/30 text-white rounded-lg px-2.5 py-1.5 text-xs font-bold backdrop-blur-md flex items-center gap-1 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                            Cambiar
                          </button>
                        </div>
                      )}

                      {verticalSlot.markedForRemoval && (
                        <div className="absolute inset-0 bg-red-950/80 flex flex-col items-center justify-center text-red-300 p-2 text-center text-xs font-bold">
                          <span className="material-symbols-outlined text-2xl mb-1">delete</span>
                          Marcada para eliminar al guardar
                        </div>
                      )}
                    </div>

                    {/* Alertas de proporción / dimensiones */}
                    {verticalSlot.ratioInfo && (
                      <div className="text-[10px] font-mono text-muted flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">straighten</span>
                        {verticalSlot.ratioInfo}
                      </div>
                    )}
                    {verticalSlot.ratioWarning && (
                      <div className="text-[11px] text-amber-600 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20 leading-tight">
                        {verticalSlot.ratioWarning}
                      </div>
                    )}

                    {/* Acciones del Slot */}
                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => verticalInputRef.current?.click()}
                        className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                      >
                        {(verticalSlot.file || (event?.imageUrlVertical && !verticalSlot.markedForRemoval)) ? 'Reemplazar' : '+ Subir imagen'}
                      </button>

                      {(verticalSlot.file || (event?.imageUrlVertical && !verticalSlot.markedForRemoval)) && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSlot('vertical')}
                          className="text-xs font-semibold text-red-500 hover:text-red-700 flex items-center gap-0.5 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[14px]">delete</span>
                          Quitar
                        </button>
                      )}
                    </div>

                    <input 
                      ref={verticalInputRef} 
                      type="file" 
                      accept="image/jpeg, image/png, image/webp" 
                      className="hidden" 
                      onChange={(e) => handleFileSelect(e, 'vertical')} 
                    />
                  </div>

                  {/* SLOT 3: IMAGEN HORIZONTAL (BANNER) */}
                  <div className="rounded-2xl border border-border bg-background/50 p-4 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-text">Imagen horizontal</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-500/10 text-blue-600 border border-blue-500/20">
                          Banner
                        </span>
                      </div>
                      <p className="text-[11px] text-muted leading-tight">
                        Para desktop, pantallas grandes y pop-up completo
                      </p>
                    </div>

                    {/* Previsualizador */}
                    <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-neutral-900 border border-border flex items-center justify-center group shadow-inner">
                      {bannerSlot.preview ? (
                        <img src={bannerSlot.preview} alt="Vista previa banner" className="w-full h-full object-cover" />
                      ) : (event?.imageUrlBanner && !bannerSlot.markedForRemoval) ? (
                        <img src={event.imageUrlBanner} alt="Banner guardado" className="w-full h-full object-cover" />
                      ) : (
                        <div 
                          className="flex flex-col items-center justify-center p-4 text-center cursor-pointer hover:bg-neutral-800/80 transition-colors w-full h-full text-muted"
                          onClick={() => bannerInputRef.current?.click()}
                        >
                          <span className="material-symbols-outlined text-3xl mb-1 text-blue-500/80">panorama</span>
                          <span className="text-xs font-semibold">Seleccionar Banner</span>
                          <span className="text-[10px] opacity-75 mt-0.5">Ej: 1920 × 1080 px</span>
                        </div>
                      )}

                      {/* Botón flotante para cambiar */}
                      {(bannerSlot.preview || (event?.imageUrlBanner && !bannerSlot.markedForRemoval)) && (
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => bannerInputRef.current?.click()}
                            className="bg-white/20 hover:bg-white/30 text-white rounded-lg px-2.5 py-1.5 text-xs font-bold backdrop-blur-md flex items-center gap-1 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                            Cambiar
                          </button>
                        </div>
                      )}

                      {bannerSlot.markedForRemoval && (
                        <div className="absolute inset-0 bg-red-950/80 flex flex-col items-center justify-center text-red-300 p-2 text-center text-xs font-bold">
                          <span className="material-symbols-outlined text-2xl mb-1">delete</span>
                          Marcada para eliminar al guardar
                        </div>
                      )}
                    </div>

                    {/* Alertas de proporción / dimensiones */}
                    {bannerSlot.ratioInfo && (
                      <div className="text-[10px] font-mono text-muted flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">straighten</span>
                        {bannerSlot.ratioInfo}
                      </div>
                    )}
                    {bannerSlot.ratioWarning && (
                      <div className="text-[11px] text-amber-600 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20 leading-tight">
                        {bannerSlot.ratioWarning}
                      </div>
                    )}

                    {/* Acciones del Slot */}
                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => bannerInputRef.current?.click()}
                        className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                      >
                        {(bannerSlot.file || (event?.imageUrlBanner && !bannerSlot.markedForRemoval)) ? 'Reemplazar' : '+ Subir imagen'}
                      </button>

                      {(bannerSlot.file || (event?.imageUrlBanner && !bannerSlot.markedForRemoval)) && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSlot('banner')}
                          className="text-xs font-semibold text-red-500 hover:text-red-700 flex items-center gap-0.5 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[14px]">delete</span>
                          Quitar
                        </button>
                      )}
                    </div>

                    <input 
                      ref={bannerInputRef} 
                      type="file" 
                      accept="image/jpeg, image/png, image/webp" 
                      className="hidden" 
                      onChange={(e) => handleFileSelect(e, 'banner')} 
                    />
                  </div>

                </div>

                {/* Botones de acción del formulario */}
                <div className="pt-4 border-t border-border flex flex-col sm:flex-row gap-3">
                  <button 
                    type="button" 
                    onClick={handleResetForm}
                    disabled={saving}
                    className="sm:w-1/3 rounded-xl border border-border bg-background hover:bg-surface text-text text-sm font-semibold py-3 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Restablecer
                  </button>
                  <button 
                    type="submit" 
                    disabled={saving || !title.trim() || !hasAtLeastOneImage}
                    className="flex-1 rounded-xl bg-gradient-to-r from-primary to-accent hover:from-primary/95 hover:to-accent/95 text-white text-sm font-bold py-3.5 shadow-soft hover:shadow-glow transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {saving ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                        <span>Guardando cambios...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
                        <span>{event ? 'Guardar Cambios del Evento' : 'Publicar Evento del Mes'}</span>
                      </>
                    )}
                  </button>
                </div>

              </form>
            </section>

          </div>
        )}

      </main>
    </div>
  );
}
