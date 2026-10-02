import type { MonthEvent, EventImageContext } from '../types/event.types';

/**
 * Prioridad de selección de imágenes según el contexto y fallback automático:
 *
 * 1. Desktop / pantalla grande:
 *    - 1°: Horizontal / Banner (imageUrlBanner)
 *    - 2°: Cuadrada (imageUrlSquare)
 *    - 3°: Vertical (imageUrlVertical)
 *    - 4°: Legacy (imageUrl)
 *
 * 2. Mobile / teléfono / formato vertical:
 *    - 1°: Vertical 9:16 (imageUrlVertical)
 *    - 2°: Cuadrada 1:1 (imageUrlSquare)
 *    - 3°: Horizontal / Banner (imageUrlBanner)
 *    - 4°: Legacy (imageUrl)
 *
 * 3. Espacio cuadrado (cards, avatares, thumbnails):
 *    - 1°: Cuadrada 1:1 (imageUrlSquare)
 *    - 2°: Vertical 9:16 (imageUrlVertical)
 *    - 3°: Horizontal / Banner (imageUrlBanner)
 *    - 4°: Legacy (imageUrl)
 *
 * Si solo existe una imagen cargada, se devolverá esa imagen en cualquier dispositivo.
 */
export function resolveEventImageUrl(
  event: MonthEvent | null | undefined,
  context: EventImageContext = 'desktop',
): string | null {
  if (!event) return null;

  const banner = event.imageUrlBanner?.trim() || null;
  const square = event.imageUrlSquare?.trim() || null;
  const vertical = event.imageUrlVertical?.trim() || null;
  const legacy = event.imageUrl?.trim() || null;

  if (context === 'mobile') {
    return vertical || square || banner || legacy || null;
  }

  if (context === 'square') {
    return square || vertical || banner || legacy || null;
  }

  // Por defecto desktop
  return banner || square || vertical || legacy || null;
}

/**
 * Devuelve un resumen de las imágenes cargadas para el evento
 */
export function getEventImageAvailability(event: MonthEvent | null | undefined) {
  if (!event) {
    return {
      hasSquare: false,
      hasVertical: false,
      hasBanner: false,
      hasLegacy: false,
      totalAvailable: 0,
    };
  }

  const hasSquare = Boolean(event.imageUrlSquare?.trim());
  const hasVertical = Boolean(event.imageUrlVertical?.trim());
  const hasBanner = Boolean(event.imageUrlBanner?.trim());
  const hasLegacy = Boolean(event.imageUrl?.trim());

  const totalAvailable = [hasSquare, hasVertical, hasBanner].filter(Boolean).length || (hasLegacy ? 1 : 0);

  return {
    hasSquare,
    hasVertical,
    hasBanner,
    hasLegacy,
    totalAvailable,
  };
}
