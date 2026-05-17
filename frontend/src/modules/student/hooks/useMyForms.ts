import { useEffect, useState } from 'react';
import { httpClient } from '../../../core/api/httpClient';

export type FormLinkItem = { id: string; title: string; url: string; order: number; };

export function useMyForms() {
  const [forms, setForms] = useState<FormLinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true); setError('');
      try {
        const res = await httpClient.request('/forms/me', { cache: 'no-store' });
        if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message ?? 'No se pudo cargar el listado.');
        
        const list = await res.json() as FormLinkItem[];
        setForms(Array.isArray(list) ? list : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo cargar el listado.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return { forms, loading, error };
}
