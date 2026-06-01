import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { httpClient } from '../../../core/api/httpClient';

export type BeltGroup = 'group1' | 'group2' | 'group3' | 'group4';
export type StudentCategory = 'CHILD' | 'ADULT';

export interface CensusData {
  total: number;
  byCategory: {
    CHILD: { count: number; percentage: number };
    ADULT: { count: number; percentage: number };
  };
  byBeltGroup: {
    group1: { count: number; percentage: number };
    group2: { count: number; percentage: number };
    group3: { count: number; percentage: number };
    group4: { count: number; percentage: number };
  };
}

export function useAdminCenso() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<CensusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [categoryFilter, setCategoryFilter] = useState((searchParams.get('category') as StudentCategory | null) ?? '');
  const [beltGroupFilter, setBeltGroupFilter] = useState((searchParams.get('beltGroup') as BeltGroup | null) ?? '');

  const loadCenso = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (categoryFilter) params.set('category', categoryFilter);
      if (beltGroupFilter) params.set('beltGroup', beltGroupFilter);

      const res = await httpClient.request(`/students/census?${params.toString()}`);
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message ?? 'No se pudo cargar el censo.');

      const payload = await res.json();
      setData(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el censo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCenso();
  }, [categoryFilter, beltGroupFilter]);

  useEffect(() => {
    const category = (searchParams.get('category') as StudentCategory | null) ?? '';
    if (category !== categoryFilter) setCategoryFilter(category);
    
    const beltGroup = (searchParams.get('beltGroup') as BeltGroup | null) ?? '';
    if (beltGroup !== beltGroupFilter) setBeltGroupFilter(beltGroup);
  }, [searchParams]);

  useEffect(() => {
    const nextParams = new URLSearchParams(searchParams);
    if (categoryFilter) nextParams.set('category', categoryFilter);
    else nextParams.delete('category');
    
    if (beltGroupFilter) nextParams.set('beltGroup', beltGroupFilter);
    else nextParams.delete('beltGroup');

    if (nextParams.toString() !== searchParams.toString()) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [categoryFilter, beltGroupFilter, searchParams, setSearchParams]);

  return {
    data, loading, error,
    categoryFilter, setCategoryFilter,
    beltGroupFilter, setBeltGroupFilter,
  };
}
