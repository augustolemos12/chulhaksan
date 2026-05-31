import { useState, useEffect, useCallback } from 'react';
import { getFees, payFullYear, registerDirectPayment, approveTransaction, rejectTransaction, generateFees } from '../../../services/fees';
import type { Fee, FeeStatus, GetFeesFilters, Transaction, PaymentMethod } from '../../../services/fees';

export function useFeesManagement() {
  const [fees, setFees] = useState<Fee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  
  const [month, setMonth] = useState<number>(currentMonth);
  const [year, setYear] = useState<number>(currentYear);
  const [statusFilter, setStatusFilter] = useState<FeeStatus | ''>('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchFees = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filters: GetFeesFilters = { month, year };
      if (statusFilter) {
        filters.status = statusFilter;
      }
      const data = await getFees(filters);
      setFees(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar cuotas');
    } finally {
      setLoading(false);
    }
  }, [month, year, statusFilter]);

  useEffect(() => {
    fetchFees();
  }, [fetchFees]);

  // Actions
  const [processing, setProcessing] = useState(false);
  
  // Pay Year Modal State
  const [payYearStudent, setPayYearStudent] = useState<{ id: number; name: string } | null>(null);
  
  // Direct Payment Modal State
  const [directPaymentFee, setDirectPaymentFee] = useState<Fee | null>(null);

  // Review Payment Modal State
  const [reviewPaymentTx, setReviewPaymentTx] = useState<Transaction | null>(null);

  const handlePayFullYear = async (method: PaymentMethod, proofFile?: File) => {
    if (!payYearStudent) return;
    setProcessing(true);
    try {
      await payFullYear(payYearStudent.id, year, method, proofFile);
      setPayYearStudent(null);
      await fetchFees();
    } catch (err: any) {
      alert(err.message || 'Error al pagar el año completo');
    } finally {
      setProcessing(false);
    }
  };

  const handleDirectPayment = async (amount: number) => {
    if (!directPaymentFee) return;
    setProcessing(true);
    try {
      await registerDirectPayment(directPaymentFee.id, amount, 'CASH');
      setDirectPaymentFee(null);
      await fetchFees();
    } catch (err: any) {
      alert(err.message || 'Error al registrar pago en efectivo');
    } finally {
      setProcessing(false);
    }
  };

  const handleApproveTransaction = async () => {
    if (!reviewPaymentTx) return;
    setProcessing(true);
    try {
      await approveTransaction(reviewPaymentTx.id);
      setReviewPaymentTx(null);
      await fetchFees();
    } catch (err: any) {
      alert(err.message || 'Error al aprobar el pago');
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectTransaction = async () => {
    if (!reviewPaymentTx) return;
    setProcessing(true);
    try {
      await rejectTransaction(reviewPaymentTx.id);
      setReviewPaymentTx(null);
      await fetchFees();
    } catch (err: any) {
      alert(err.message || 'Error al rechazar el pago');
    } finally {
      setProcessing(false);
    }
  };

  const handleGenerateFees = async (genMonth: number, genYear: number, dueDate: string) => {
    setProcessing(true);
    try {
      const res = await generateFees(genMonth, genYear, dueDate);
      alert(`Generación exitosa. ${res.createdCount} cuotas creadas.`);
      await fetchFees();
      return true;
    } catch (err: any) {
      alert(err.message || 'Error al generar cuotas');
      return false;
    } finally {
      setProcessing(false);
    }
  };

  // Filter fees locally by search query
  const filteredFees = fees.filter(fee => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const name = `${fee.student?.firstName} ${fee.student?.lastName}`.toLowerCase();
    const dni = fee.student?.dni.toLowerCase();
    return name.includes(q) || dni?.includes(q);
  });

  return {
    fees: filteredFees,
    loading,
    error,
    month, setMonth,
    year, setYear,
    statusFilter, setStatusFilter,
    searchQuery, setSearchQuery,
    processing,
    payYearStudent, setPayYearStudent, handlePayFullYear,
    directPaymentFee, setDirectPaymentFee, handleDirectPayment,
    reviewPaymentTx, setReviewPaymentTx, handleApproveTransaction, handleRejectTransaction,
    handleGenerateFees
  };
}
