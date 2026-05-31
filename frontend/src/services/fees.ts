import { apiFetch } from './api';

export type FeeStatus = 'PENDING' | 'PARTIALLY_PAID' | 'PAID';
export type PaymentMethod = 'CASH' | 'TRANSFER';

export type PaymentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Transaction {
  id: number;
  feeId: number;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  proofImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Fee {
  id: number;
  studentId: number;
  month: number;
  year: number;
  baseAmount: number;
  surchargeAmount: number;
  totalAmount: number;
  paidAmount: number;
  dueDate: string;
  status: FeeStatus;
  lateFeeApplied: boolean;
  createdAt: string;
  updatedAt: string;
  student?: {
    id: number;
    firstName: string;
    lastName: string;
    dni: string;
  };
  payments?: Transaction[];
}

export interface GetFeesFilters {
  month?: number;
  year?: number;
  status?: FeeStatus;
  studentId?: number;
}

export async function getFees(filters: GetFeesFilters): Promise<Fee[]> {
  const queryParams = new URLSearchParams();
  if (filters.month) queryParams.append('month', filters.month.toString());
  if (filters.year) queryParams.append('year', filters.year.toString());
  if (filters.status) queryParams.append('status', filters.status);
  if (filters.studentId) queryParams.append('studentId', filters.studentId.toString());

  const response = await apiFetch(`/fees?${queryParams.toString()}`);
  if (!response.ok) {
    throw new Error('Error al obtener las cuotas');
  }
  return response.json();
}

export async function payFullYear(studentId: number, year: number, method: PaymentMethod = 'CASH', proofFile?: File): Promise<{ success: boolean; message: string }> {
  const formData = new FormData();
  formData.append('studentId', studentId.toString());
  formData.append('year', year.toString());
  formData.append('method', method);
  if (proofFile) {
    formData.append('image', proofFile);
  }

  const response = await apiFetch('/fees/pay-year', {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) {
    throw new Error('Error al registrar pago de año completo');
  }
  return response.json();
}

export async function approveTransaction(transactionId: number): Promise<any> {
  const response = await apiFetch(`/transactions/${transactionId}/approve`, {
    method: 'PATCH',
  });
  if (!response.ok) {
    throw new Error('Error al aprobar la transacción');
  }
  return response.json();
}

export async function rejectTransaction(transactionId: number): Promise<any> {
  const response = await apiFetch(`/transactions/${transactionId}/reject`, {
    method: 'PATCH',
  });
  if (!response.ok) {
    throw new Error('Error al rechazar la transacción');
  }
  return response.json();
}

export async function registerDirectPayment(feeId: number, amount: number, method: PaymentMethod = 'CASH') {
  const response = await apiFetch('/transactions/direct', {
    method: 'POST',
    json: true,
    body: JSON.stringify({ feeId, amount, method }),
  });
  if (!response.ok) {
    throw new Error('Error al registrar pago en efectivo');
  }
  return response.json();
}
