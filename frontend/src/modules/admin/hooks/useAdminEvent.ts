import { useState, useEffect } from 'react';
import { httpClient } from '../../../core/api/httpClient';

export type MonthEvent = {
  id: number;
  title: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
};

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

  const uploadEvent = async (title: string, imageFile: File) => {
    setSaving(true);
    setActionError('');
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('image', imageFile);

      const res = await httpClient.request('/events', {
        method: 'POST',
        // httpClient takes care of NOT setting application/json when passing FormData
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
