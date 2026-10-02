import { useState, useEffect } from 'react';
import { httpClient } from '../../../core/api/httpClient';
import type { MonthEvent } from '../../events/types/event.types';

export type { MonthEvent };

export interface SaveEventPayload {
  title: string;
  imageSquare?: File | null;
  imageVertical?: File | null;
  imageBanner?: File | null;
  removeSquare?: boolean;
  removeVertical?: boolean;
  removeBanner?: boolean;
}

export function useAdminEvent() {
  const [event, setEvent] = useState<MonthEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState('');

  const loadEvent = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await httpClient.request('/events', { cache: 'no-store' });
      if (!res.ok) {
        if (res.status === 404) {
          setEvent(null);
          return;
        }
        throw new Error((await res.json().catch(() => ({}))).message ?? 'No se pudo cargar el evento.');
      }
      const data = await res.json() as MonthEvent;
      setEvent(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar el evento.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvent();
  }, []);

  const uploadEvent = async (payloadOrTitle: SaveEventPayload | string, legacyFile?: File) => {
    setSaving(true);
    setActionError('');
    try {
      const formData = new FormData();

      if (typeof payloadOrTitle === 'string') {
        formData.append('title', payloadOrTitle);
        if (legacyFile) {
          formData.append('image', legacyFile);
        }
      } else {
        formData.append('title', payloadOrTitle.title);
        if (payloadOrTitle.imageSquare) {
          formData.append('imageSquare', payloadOrTitle.imageSquare);
        }
        if (payloadOrTitle.imageVertical) {
          formData.append('imageVertical', payloadOrTitle.imageVertical);
        }
        if (payloadOrTitle.imageBanner) {
          formData.append('imageBanner', payloadOrTitle.imageBanner);
        }
        if (payloadOrTitle.removeSquare) {
          formData.append('removeSquare', 'true');
        }
        if (payloadOrTitle.removeVertical) {
          formData.append('removeVertical', 'true');
        }
        if (payloadOrTitle.removeBanner) {
          formData.append('removeBanner', 'true');
        }
      }

      const res = await httpClient.request('/events', {
        method: 'POST',
        // httpClient does not set application/json when passing FormData
        body: formData,
      });

      if (!res.ok) {
        throw new Error((await res.json().catch(() => ({}))).message ?? 'No se pudo guardar el evento.');
      }

      await loadEvent();
      return true;
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'No se pudo guardar el evento.');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const deleteEvent = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar el evento del mes actual? Esta acción no se puede deshacer.')) {
      return false;
    }
    
    setDeleting(true);
    setActionError('');
    try {
      const res = await httpClient.request('/events', {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error((await res.json().catch(() => ({}))).message ?? 'No se pudo eliminar el evento.');
      }

      setEvent(null);
      return true;
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'No se pudo eliminar el evento.');
      return false;
    } finally {
      setDeleting(false);
    }
  };

  return {
    event,
    loading,
    error,
    saving,
    deleting,
    actionError,
    uploadEvent,
    deleteEvent,
    reload: loadEvent,
  };
}
