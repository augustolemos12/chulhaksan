import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAdminEvent } from '../hooks/useAdminEvent';

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
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validar tipo y tamaño
      if (!selectedFile.type.match(/^image\/(jpeg|png|webp)$/)) {
        alert('Solo se permiten imágenes JPG, PNG o WEBP');
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        alert('La imagen no puede pesar más de 5 MB');
        return;
      }
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    } else {
      setFile(null);
      setPreview(null);
    }
  };

  const handleClearForm = () => {
    setTitle('');
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !file) {
      alert('Debes ingresar un título y seleccionar una imagen.');
      return;
    }
    const success = await uploadEvent(title, file);
    if (success) {
      handleClearForm();
    }
  };

  return (
    <div className="min-h-screen bg-background text-text">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center p-4 justify-between w-full max-w-md sm:max-w-lg md:max-w-2xl mx-auto">
          <Link className="text-text flex size-10 shrink-0 items-center justify-center" to="/dashboard">
            <span className="material-symbols-outlined">arrow_back_ios</span>
          </Link>
          <h1 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-10">
            Evento del mes
          </h1>
        </div>
      </header>

      <main className="w-full max-w-md sm:max-w-lg md:max-w-2xl mx-auto p-4 pb-24 space-y-6">
        
        {loading ? (
          <div className="bg-surface p-4 rounded-xl text-sm text-muted border border-border text-center">
            Cargando evento actual...
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-xl text-sm text-red-600 border border-red-200">
            {error}
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* EVENTO ACTUAL */}
            <section className="bg-surface rounded-2xl border border-border shadow-soft p-5 space-y-4">
              <h2 className="text-sm uppercase tracking-[0.2em] text-primary font-bold">
                Evento Publicado
              </h2>
              
              {event ? (
                <div className="space-y-4">
                  <div className="overflow-hidden rounded-xl relative shadow-md">
                    <img 
                      src={event.imageUrl} 
                      alt={event.title} 
                      className="w-full h-48 sm:h-64 object-cover"
                    />
                    <div className="absolute bottom-0 left-0 p-4 bg-gradient-to-t from-black/80 to-transparent w-full">
                      <h3 className="text-xl font-bold text-white drop-shadow-md">
                        {event.title}
                      </h3>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button 
                      onClick={deleteEvent} 
                      disabled={deleting}
                      className="flex items-center gap-2 rounded-lg border border-red-200 text-red-600 text-sm font-semibold px-4 py-2 hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                      {deleting ? 'Eliminando...' : 'Quitar evento'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-muted">
                  <span className="material-symbols-outlined text-4xl mb-2 opacity-50">event_busy</span>
                  <p className="text-sm font-medium">No hay ningún evento del mes publicado.</p>
                </div>
              )}
            </section>

            {/* FORMULARIO DE CARGA */}
            <section className="bg-surface rounded-2xl border border-border shadow-soft p-5 space-y-4">
              <h2 className="text-sm uppercase tracking-[0.2em] text-primary font-bold">
                {event ? 'Reemplazar Evento' : 'Publicar Nuevo Evento'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {actionError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                    {actionError}
                  </div>
                )}
                
                <div className="space-y-1">
                  <label className="text-xs text-muted font-medium">Título del evento</label>
                  <input 
                    type="text" 
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:ring-1 focus:ring-primary outline-none" 
                    placeholder="Ej: Examen de Cinturones de Mayo" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    maxLength={200}
                    required 
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-muted font-medium">Imagen promocional (JPG, PNG, WEBP - Max 5MB)</label>
                  
                  {!preview ? (
                    <div 
                      className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-background transition-colors text-muted"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <span className="material-symbols-outlined text-3xl mb-2">add_photo_alternate</span>
                      <p className="text-sm font-medium">Haz clic para seleccionar imagen</p>
                    </div>
                  ) : (
                    <div className="relative rounded-xl overflow-hidden shadow-soft border border-border">
                      <img src={preview} alt="Vista previa" className="w-full h-40 object-cover opacity-90" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
                        <button 
                          type="button" 
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-surface/20 hover:bg-surface/30 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                          Cambiar
                        </button>
                      </div>
                    </div>
                  )}

                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept="image/jpeg, image/png, image/webp" 
                    className="hidden"
                    onChange={handleFileChange} 
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  {(title || file) && (
                    <button 
                      type="button" 
                      onClick={handleClearForm}
                      disabled={saving}
                      className="flex-1 rounded-xl border border-border bg-background text-text text-sm font-semibold py-3 disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                  )}
                  <button 
                    type="submit" 
                    disabled={saving || !title || !file}
                    className="flex-1 rounded-xl bg-primary text-white text-sm font-semibold py-3 disabled:opacity-50 flex justify-center items-center gap-2 shadow-soft hover:shadow-md transition-all active:scale-[0.98]"
                  >
                    {saving ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                        Subiendo...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[18px]">publish</span>
                        Publicar Evento
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
