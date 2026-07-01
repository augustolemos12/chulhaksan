import { useEffect, useState, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { authService } from '../../auth/api/authService';
import { httpClient } from '../../../core/api/httpClient';

import { payFullYear, registerDirectPayment, approveTransaction, rejectTransaction } from '../../../services/fees';
import type { Fee, Transaction } from '../../../services/fees';

export type StudentData = {
  id: number;
  dni: string;
  userId?: number;
  gymId?: string | null;
  firstName: string;
  lastName: string;
  category?: 'ADULT' | 'CHILD';
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  gym?: { id: number; name: string } | null;
  classGroup?: { id: number; name: string } | null;
  currentBelt?: string;
};

export function useStudentDetails() {
  const { dni } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const profile = authService.getCurrentProfile();
  const isTeacher = profile?.role === 'TEACHER';
  const canManageForms = profile?.role === 'TEACHER' || profile?.role === 'ADMIN';

  const returnTo = searchParams.get('returnTo')?.startsWith('/')
    ? searchParams.get('returnTo')!
    : profile?.role === 'ADMIN' ? '/admin/alumnos' : '/profesor/alumnos';

  const [student, setStudent] = useState<StudentData | null>(null);
  const [fees, setFees] = useState<Fee[]>([]);
  const [classGroups, setClassGroups] = useState<{ id: number; name: string; isActive: boolean }[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '', lastName: '', category: 'ADULT' as 'ADULT' | 'CHILD',
    email: '', phone: '', address: '', classGroupId: '', currentBelt: 'WHITE',
  });

  const [isResettingPass, setIsResettingPass] = useState(false);
  const [resetPassTemp, setResetPassTemp] = useState('');
  const [copiedReset, setCopiedReset] = useState(false);

  const [actionLoading, setActionLoading] = useState<'unassign' | 'delete' | null>(null);
  
  // Fees Modals States
  const [processingFees, setProcessingFees] = useState(false);
  const [payYearStudent, setPayYearStudent] = useState<{ id: number; name: string } | null>(null);
  const [directPaymentFee, setDirectPaymentFee] = useState<Fee | null>(null);
  const [reviewPaymentTx, setReviewPaymentTx] = useState<Transaction | null>(null);
  const [viewReceiptsFee, setViewReceiptsFee] = useState<Fee | null>(null);

  const fetchFees = async (studentId: number) => {
    try {
      const feesRes = await httpClient.get<Fee[]>(`/fees/student/${studentId}`);
      setFees(feesRes ?? []);
    } catch (err) {
      console.error('Error cargando cuotas', err);
    }
  };

  useEffect(() => {
    if (!dni) {
      setErrorMsg('Iniciá sesión para ver el alumno.');
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const studentRes = await httpClient.get<StudentData>(`/students/dni/${dni}`);
        if (!studentRes || !studentRes.id) throw new Error('Alumno no encontrado');

        setStudent(studentRes);
        setEditForm({
          firstName: studentRes.firstName ?? '', lastName: studentRes.lastName ?? '',
          category: studentRes.category ?? 'ADULT', email: studentRes.email ?? '',
          phone: studentRes.phone ?? '', address: studentRes.address ?? '',
          classGroupId: studentRes.classGroup?.id?.toString() ?? '',
          currentBelt: studentRes.currentBelt ?? 'WHITE',
        });

        await fetchFees(studentRes.id);
        
        if (canManage) {
          const endpoint = isAdmin ? '/class-groups' : '/teacher/class-groups';
          try {
            const cgRes = await httpClient.get<{items: any[]} | any[]>(endpoint);
            const items = Array.isArray(cgRes) ? cgRes : (cgRes?.items ?? []);
            setClassGroups(items);
          } catch (e) {
            console.error('Error fetching class groups', e);
          }
        }
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : 'No se pudo cargar el alumno.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [dni, canManageForms]);

  const toggleEditMode = () => setIsEditing((prev) => !prev);
  const updateEditForm = (field: keyof typeof editForm, value: string) => setEditForm((prev) => ({ ...prev, [field]: value }));

  const handlePayFullYear = async (method: 'CASH' | 'TRANSFER', proofFile?: File) => {
    if (!payYearStudent || !student) return;
    setProcessingFees(true);
    try {
      // Usamos el año de la primera cuota pendiente o el año actual
      const yearToPay = fees.find(f => f.status !== 'PAID')?.year || new Date().getFullYear();
      await payFullYear(payYearStudent.id, yearToPay, method, proofFile);
      setPayYearStudent(null);
      await fetchFees(student.id);
    } catch (err: any) {
      alert(err.message || 'Error al pagar el año completo');
    } finally {
      setProcessingFees(false);
    }
  };

  const handleDirectPayment = async (amount: number) => {
    if (!directPaymentFee || !student) return;
    setProcessingFees(true);
    try {
      await registerDirectPayment(directPaymentFee.id, amount, 'CASH');
      setDirectPaymentFee(null);
      await fetchFees(student.id);
    } catch (err: any) {
      alert(err.message || 'Error al registrar pago en efectivo');
    } finally {
      setProcessingFees(false);
    }
  };

  const handleApproveTransaction = async (amount: number) => {
    if (!reviewPaymentTx || !student) return;
    setProcessingFees(true);
    try {
      await approveTransaction(reviewPaymentTx.id, amount);
      setReviewPaymentTx(null);
      await fetchFees(student.id);
    } catch (err: any) {
      alert(err.message || 'Error al aprobar el pago');
    } finally {
      setProcessingFees(false);
    }
  };

  const handleRejectTransaction = async () => {
    if (!reviewPaymentTx || !student) return;
    setProcessingFees(true);
    try {
      await rejectTransaction(reviewPaymentTx.id);
      setReviewPaymentTx(null);
      await fetchFees(student.id);
    } catch (err: any) {
      alert(err.message || 'Error al rechazar el pago');
    } finally {
      setProcessingFees(false);
    }
  };

  const saveProfile = async () => {
    if (!student?.id) return;
    setIsSaving(true);
    setErrorMsg('');
    try {
      const payload = {
        firstName: editForm.firstName.trim() || null, lastName: editForm.lastName.trim() || null,
        category: editForm.category, email: editForm.email.trim() || null,
        phone: editForm.phone.trim() || null, address: editForm.address.trim() || null,
        classGroupId: editForm.classGroupId ? Number(editForm.classGroupId) : undefined,
        currentBelt: editForm.currentBelt || undefined,
      };
      
      const endpoint = isTeacher ? `/teacher/students/${student.id}` : `/students/${student.id}`;
      const res = await httpClient.request(endpoint, { method: 'PATCH', json: true, body: JSON.stringify(payload) });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? 'Error al actualizar alumno');
      }
      const updated = await res.json() as StudentData;
      setStudent(updated);
      setIsEditing(false);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'No se pudo actualizar el alumno.');
    } finally {
      setIsSaving(false);
    }
  };



  const studentName = useMemo(() => student ? `${student.firstName} ${student.lastName}` : 'Alumno', [student]);

  const isAdmin = profile?.role === 'ADMIN';
  const canManage = isTeacher || isAdmin;

  const resetPassword = async () => {
    if (!dni || !confirm('¿Quieres resetear la contraseña de este alumno?')) return;
    setIsResettingPass(true);
    setErrorMsg('');
    try {
      let data;
      if (isTeacher) {
        data = await httpClient.post<{ temporaryPassword?: string }>(`/teachers/me/students/${dni}/reset-password`, {});
      } else if (isAdmin && student?.userId) {
        data = await httpClient.post<{ temporaryPassword?: string }>(`/auth/admin/users/${student.userId}/reset-password`, {});
      } else {
        throw new Error('No tienes permisos para resetear la contraseña o falta el usuario.');
      }
      if (!data.temporaryPassword) throw new Error('No se recibio la contraseña temporal.');
      setResetPassTemp(data.temporaryPassword);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'No se pudo resetear la contraseña.');
    } finally {
      setIsResettingPass(false);
    }
  };

  const copyResetPassword = async () => {
    if (!resetPassTemp) return;
    try {
      await navigator.clipboard.writeText(resetPassTemp);
      setCopiedReset(true);
      setTimeout(() => setCopiedReset(false), 1500);
    } catch {
      setCopiedReset(false);
    }
  };

  const unassignStudent = async () => {
    if (!student?.id || !confirm('¿Quieres desasignar este alumno?')) return;
    setActionLoading('unassign');
    try {
      await httpClient.post(`/teacher/students/${student.id}/unassign`, {});
      navigate(returnTo);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error al desasignar.');
    } finally {
      setActionLoading(null);
    }
  };

  const deleteStudent = async () => {
    if (!student?.id || !confirm('¿Quieres eliminar este alumno? Esta acción no se puede deshacer.')) return;
    setActionLoading('delete');
    try {
      const endpoint = isTeacher ? `/teacher/students/${student.id}` : `/students/${student.id}`;
      await httpClient.request(endpoint, { method: 'DELETE' });
      navigate(returnTo);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error al eliminar.');
    } finally {
      setActionLoading(null);
    }
  };

  return {
    student, studentName, fees,
    isLoading, errorMsg, isEditing, isSaving, editForm, updateEditForm, toggleEditMode, saveProfile,
    isResettingPass, resetPassTemp, copiedReset, resetPassword, copyResetPassword,
    actionLoading, unassignStudent, deleteStudent,
    
    processingFees,
    payYearStudent, setPayYearStudent, handlePayFullYear,
    directPaymentFee, setDirectPaymentFee, handleDirectPayment,
    reviewPaymentTx, setReviewPaymentTx, handleApproveTransaction, handleRejectTransaction,
    viewReceiptsFee, setViewReceiptsFee,
    
    returnTo, isTeacher, isAdmin, canManage, classGroups
  };
}
