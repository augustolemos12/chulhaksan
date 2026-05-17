import { useEffect, useState } from 'react';
import { httpClient } from '../../../core/api/httpClient';

export type FormLinkItem = { id: string; title: string; url: string; order: number; };
export type FormEdit = { title: string; url: string; };

export const emptyEdit: FormEdit = { title: '', url: '' };

export function useFormsManager() {
  const [forms, setForms] = useState<FormLinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [creating, setCreating] = useState(false);
  const [createEdit, setCreateEdit] = useState<FormEdit>(emptyEdit);
  
  const [editing, setEditing] = useState<FormLinkItem | null>(null);
  const [edit, setEdit] = useState<FormEdit>(emptyEdit);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true); setError('');
    try {
      const res = await httpClient.request('/forms', { cache: 'no-store' });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message ?? 'No se pudo cargar el listado.');
      
      const list = await res.json() as FormLinkItem[];
      setForms(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar el listado.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    const titleValue = createEdit.title.trim();
    const urlValue = createEdit.url.trim();

    if (!titleValue || !urlValue) return;

    setCreating(true); setError('');
    try {
      const res = await httpClient.request('/forms', {
        method: 'POST', json: true, body: JSON.stringify({ title: titleValue, url: urlValue }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message ?? 'No se pudo crear la forma.');
      
      setCreateEdit(emptyEdit);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la forma.');
    } finally {
      setCreating(false);
    }
  };

  const openEdit = (form: FormLinkItem) => {
    setEditing(form);
    setEdit({ title: form.title ?? '', url: form.url ?? '' });
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editing) return;

    const titleValue = edit.title.trim();
    const urlValue = edit.url.trim();

    setSaving(true); setError('');
    try {
      const res = await httpClient.request(`/forms/${editing.id}`, {
        method: 'PATCH', json: true, body: JSON.stringify({ title: titleValue, url: urlValue }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message ?? 'No se pudo guardar la forma.');
      
      setEditing(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar la forma.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (form: FormLinkItem) => {
    if (!confirm(`¿Eliminar "${form.title}"?`)) return;
    setError('');
    try {
      const res = await httpClient.request(`/forms/${form.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message ?? 'No se pudo eliminar la forma.');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar la forma.');
    }
  };

  return {
    forms, loading, error, creating, createEdit, setCreateEdit, handleCreate,
    editing, setEditing, edit, setEdit, saving, handleSave, openEdit, handleDelete
  };
}
