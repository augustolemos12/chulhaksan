import { useState, useEffect } from 'react';
import { httpClient } from '../../../core/api/httpClient';

export type FeeConfig = {
  id: number;
  baseAmount: number;
  lateFee: number;
  validFrom: string;
  createdAt: string;
};

export function useAdminFeeConfig() {
  const [history, setHistory] = useState<FeeConfig[]>([]);
  const [latestConfig, setLatestConfig] = useState<FeeConfig | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState('');

  const loadConfigs = async () => {
    setLoading(true);
    setError('');
    try {
      const [latestRes, historyRes] = await Promise.all([
        httpClient.request('/fee-config/latest', { cache: 'no-store' }),
        httpClient.request('/fee-config', { cache: 'no-store' })
      ]);

      if (latestRes.ok) {
        const data = await latestRes.json();
        setLatestConfig(data);
      } else if (latestRes.status === 404) {
        setLatestConfig(null);
      } else {
        throw new Error((await latestRes.json().catch(() => ({}))).message ?? 'Error cargando cuota actual');
      }

      if (historyRes.ok) {
        const data = await historyRes.json();
        setHistory(Array.isArray(data) ? data : data?.data ?? []);
      } else {
        throw new Error((await historyRes.json().catch(() => ({}))).message ?? 'Error cargando historial de cuotas');
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar la configuración de cuotas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfigs();
  }, []);

  const createFeeConfig = async (baseAmount: number, lateFee: number, validFrom: string) => {
    setSaving(true);
    setActionError('');
    try {
      const res = await httpClient.request('/fee-config', {
        method: 'POST',
        json: true,
        body: JSON.stringify({ baseAmount, lateFee, validFrom })
      });

      if (!res.ok) {
        throw new Error((await res.json().catch(() => ({}))).message ?? 'No se pudo guardar la configuración.');
      }

      await loadConfigs();
      return true;
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'No se pudo guardar la configuración.');
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    history,
    latestConfig,
    loading,
    error,
    saving,
    actionError,
    createFeeConfig,
    reload: loadConfigs
  };
}
