import React from 'react';
import type { MonthEvent, EventImageContext } from '../types/event.types';
import { resolveEventImageUrl } from '../utils/eventImageResolver';

interface ResponsiveEventImageProps {
  event: MonthEvent;
  alt?: string;
  context?: EventImageContext | 'auto';
  className?: string;
  imgClassName?: string;
  loading?: 'lazy' | 'eager';
  objectFit?: 'cover' | 'contain';
}

/**
 * Componente que renderiza la imagen del evento adaptada automáticamente al dispositivo
 * respetando las prioridades y fallbacks especificados:
 * - Desktop: Banner -> Cuadrada -> Vertical
 * - Mobile: Vertical -> Cuadrada -> Banner
 * - Square: Cuadrada -> Vertical -> Banner
 */
export const ResponsiveEventImage: React.FC<ResponsiveEventImageProps> = ({
  event,
  alt = event.title || 'Evento del Mes',
  context = 'auto',
  className = '',
  imgClassName = '',
  loading = 'lazy',
  objectFit = 'cover',
}) => {
  const desktopUrl = resolveEventImageUrl(event, 'desktop');
  const mobileUrl = resolveEventImageUrl(event, 'mobile');
  const squareUrl = resolveEventImageUrl(event, 'square');

  const fitClass = objectFit === 'contain' ? 'object-contain' : 'object-cover';

  if (!desktopUrl && !mobileUrl && !squareUrl) {
    return null;
  }

  if (context === 'square') {
    return (
      <div className={`overflow-hidden relative ${className}`}>
        <img
          src={squareUrl || desktopUrl || ''}
          alt={alt}
          loading={loading}
          className={`w-full h-full ${fitClass} ${imgClassName}`}
        />
      </div>
    );
  }

  if (context === 'mobile') {
    return (
      <div className={`overflow-hidden relative ${className}`}>
        <img
          src={mobileUrl || desktopUrl || ''}
          alt={alt}
          loading={loading}
          className={`w-full h-full ${fitClass} ${imgClassName}`}
        />
      </div>
    );
  }

  if (context === 'desktop') {
    return (
      <div className={`overflow-hidden relative ${className}`}>
        <img
          src={desktopUrl || mobileUrl || ''}
          alt={alt}
          loading={loading}
          className={`w-full h-full ${fitClass} ${imgClassName}`}
        />
      </div>
    );
  }

  // Modo auto: usa <picture> para que el navegador cambie en vivo según el ancho
  return (
    <div className={`overflow-hidden relative ${className}`}>
      <picture className="w-full h-full block">
        {mobileUrl && (
          <source media="(max-width: 767px)" srcSet={mobileUrl} />
        )}
        <img
          src={desktopUrl || mobileUrl || ''}
          alt={alt}
          loading={loading}
          className={`w-full h-full ${fitClass} ${imgClassName}`}
        />
      </picture>
    </div>
  );
};
