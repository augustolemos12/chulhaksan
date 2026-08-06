import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { httpClient } from '../../../core/api/httpClient';
import type { AdminTeacher, TeacherForm } from './useAdminTeachers';
import { emptyForm } from './useAdminTeachers';

export function useAdminTeacherDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/admin/profesores';

  const [studentPage, setStudentPage] = useState(Math.max(1, Number(searchParams.get('page') ?? '1')));
  const studentPageSize = 10;

  useEffect(() => {
    const pageParam = Math.max(1, Number(searchParams.get('page') ?? '1'));
    if (!Number.isNaN(pageParam) && pageParam !== studentPage) setStudentPage(pageParam);
  }, [searchParams]);

  useEffect(() => {
    const nextParams = new URLSearchParams(searchParams);
    if (studentPage > 1) nextParams.set('page', String(studentPage)); else nextParams.delete('page');
    if (nextParams.toString() !== searchParams.toString()) setSearchParams(nextParams, { replace: true });
  }, [studentPage]);

  const [teacher, setTeacher] = useState<AdminTeacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<TeacherForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');

  const [actionLoading, setActionLoading] = useState<'delete' | null>(null);
  const [resetting, setResetting] = useState(false);
  const [resetInfo, setResetInfo] = useState('');

  // Payment State
  const [paymentSaving, setPaymentSaving] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null);
  const [walletUrl, setWalletUrl] = useState('');
  const [lateFeeWalletUrl, setLateFeeWalletUrl] = useState('');

  const loadTeacher = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await httpClient.request(`/teachers/${id}`);
      if (!res.ok) {
        throw new Error((await res.json().catch(() => ({}))).message || 'No se pudo cargar el profesor.');
      }
      const data = await res.json();
      setTeacher(data);
      setWalletUrl(data.walletUrl || '');
      setLateFeeWalletUrl(data.lateFeeWalletUrl || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadTeacher();
  }, [id]);

  const openEdit = () => {
    if (!teacher) return;
    setForm({
      firstName: teacher.firstName || '',
      lastName: teacher.lastName || '',
      email: teacher.email || '',
      phone: teacher.phone || '',
    });
    setResetInfo('');
    setEditError('');
    setIsEditing(true);
  };

  const closeEdit = () => {
    setIsEditing(false);
    setEditError('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setEditError('');
    try {
      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
      };
      const res = await httpClient.request(`/teachers/${id}`, {
        method: 'PATCH',
        json: true,
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || 'Error al guardar.');
      await loadTeacher();
      closeEdit();
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Error al guardar.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!teacher) return;
    if (!confirm(`¿Eliminar al profesor ${teacher.firstName} ${teacher.lastName}?`)) return;
    setActionLoading('delete');
    try {
      const res = await httpClient.request(`/teachers/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || 'Error al eliminar.');
      navigate(returnTo);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleResetPassword = async () => {
    if (!teacher?.userId) return alert('Usuario no encontrado.');
    if (!confirm('¿Querés resetear la contraseña de este profesor?')) return;
    setResetting(true);
    setResetInfo('');
    try {
      const res = await httpClient.request(`/auth/admin/users/${teacher.userId}/reset-password`, { method: 'POST' });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || 'Error al resetear.');
      const data = await res.json();
      if (!data.temporaryPassword) throw new Error('No se recibió contraseña.');
      setResetInfo(data.temporaryPassword);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al resetear contraseña.');
    } finally {
      setResetting(false);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentSaving(true);
    setPaymentError(null);
    setPaymentSuccess(null);

    if (walletUrl.trim() && !/^https?:\/\/[^\s$.?#].[^\s]*$/i.test(walletUrl.trim())) {
      setPaymentError('El enlace normal debe ser una URL válida.');
      setPaymentSaving(false);
      return;
    }

    if (lateFeeWalletUrl.trim() && !/^https?:\/\/[^\s$.?#].[^\s]*$/i.test(lateFeeWalletUrl.trim())) {
      setPaymentError('El enlace de mora debe ser una URL válida.');
      setPaymentSaving(false);
      return;
    }

    try {
      const payload = {
        walletUrl: walletUrl.trim(),
        lateFeeWalletUrl: lateFeeWalletUrl.trim(),
      };

      const res = await httpClient.request(`/teachers/${id}/payment-info`, {
        method: 'PATCH',
        json: true,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Error al guardar.');
      }

      const data = await res.json();
      setWalletUrl(data.walletUrl || '');
      setLateFeeWalletUrl(data.lateFeeWalletUrl || '');
      setPaymentSuccess('Datos actualizados correctamente.');
      setTimeout(() => setPaymentSuccess(null), 4000);
      await loadTeacher(); // Reload the teacher just to keep everything in sync
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : 'Error al guardar.');
    } finally {
      setPaymentSaving(false);
    }
  };

  return {
    teacher, loading, error, returnTo, navigate,
    isEditing, form, setForm, saving, editError, openEdit, closeEdit, handleSave,
    handleDelete, actionLoading,
    handleResetPassword, resetting, resetInfo,
    paymentSaving, paymentError, paymentSuccess, 
    walletUrl, setWalletUrl,
    lateFeeWalletUrl, setLateFeeWalletUrl,
    handlePaymentSubmit,
    studentPage, setStudentPage, studentPageSize,
  };
}
