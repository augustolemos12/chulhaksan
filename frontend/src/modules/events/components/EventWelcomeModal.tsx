import React, { useEffect } from 'react';
import type { MonthEvent } from '../types/event.types';
import { ResponsiveEventImage } from './ResponsiveEventImage';

interface EventWelcomeModalProps {
  event: MonthEvent | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EventWelcomeModal: React.FC<EventWelcomeModalProps> = ({
  event,
  isOpen,
  onClose,
}) => {
  // Manejo de tecla Escape y bloqueo de scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen || !event) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-event-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 md:p-8 bg-black/85 backdrop-blur-md transition-all duration-300 animate-fadeIn"
      onClick={onClose}
    >
      {/* Contenedor Principal: En Desktop ocupa casi toda la pantalla; en Mobile se adapta verticalmente */}
      <div
        className="relative w-full max-w-6xl h-[86vh] max-h-[820px] rounded-3xl overflow-hidden shadow-2xl border border-white/15 bg-neutral-950 flex flex-col justify-between transition-all duration-300 animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Imagen del evento con selección responsiva automática y fallback */}
        <div className="absolute inset-0 z-0">
          <ResponsiveEventImage
            event={event}
            context="auto"
            className="w-full h-full"
            imgClassName="w-full h-full object-cover object-center"
            loading="eager"
          />
          {/* Viñeta oscura superior para contraste del botón X */}
          <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none" />
          {/* Gradiente inferior para legibilidad del título y contenido */}
          <div className="absolute inset-x-0 bottom-0 h-72 sm:h-80 bg-gradient-to-t from-black/95 via-black/60 to-transparent pointer-events-none" />
        </div>

        {/* Barra superior con botón "X" claramente visible */}
        <div className="relative z-20 flex items-center justify-between p-4 sm:p-6 w-full">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/90 text-white text-xs sm:text-sm font-bold uppercase tracking-wider shadow-lg backdrop-blur-md border border-white/20">
            <span className="material-symbols-outlined text-[16px]">campaign</span>
            Evento del Mes
          </span>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar ventana de evento del mes"
            className="group flex items-center justify-center size-11 sm:size-12 rounded-full bg-black/60 hover:bg-black/90 text-white border-2 border-white/40 hover:border-white shadow-xl backdrop-blur-md transition-all duration-200 active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-2xl font-bold group-hover:rotate-90 transition-transform duration-200">
              close
            </span>
          </button>
        </div>

        {/* Zona inferior con información destacada y llamada a la acción */}
        <div className="relative z-20 p-6 sm:p-8 md:p-12 max-w-3xl">
          <h2
            id="modal-event-title"
            className="font-display text-2xl sm:text-4xl md:text-5xl font-black text-white leading-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)] tracking-tight mb-4"
          >
            {event.title}
          </h2>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-bold py-3 px-6 sm:px-8 rounded-xl shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer text-sm sm:text-base"
            >
              <span>Continuar a la web</span>
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
