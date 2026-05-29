# Decisiones y consideraciones sobre las funcionalidades relacionadas con las cuotas y los pagos

## Objetivo del módulo
El módulo permite:
- Registrar cuotas mensuales de alumnos
- Modificar la configuración global de la cuota
- Reportar pagos por transferencia
- Registrar pagos en efectivo
- Revisar pagos pendientes
- Aprobar/rechazar pagos
- Calcular automáticamente el estado financiero de cada cuota

## Conceptos del dominio
- *Fee*: Representa la cuota mensual de un alumno en un mes determinado.
    * El campo baseAmount es el monto base de la cuota.
    * El campo surchargeAmount es el monto agregado debido a retraso en el pago de la cuota.
    * El campo totalAmount es el monto total, incluido el base y el recargo si lo hay.
    * El campo paidAmount es el monto parcial o total pagado por el alumno. Este monto es el que ya ha sido aprobado.
    * Una cuota está relacionada con varios pagos (relación uno a muchos de Fee con Transaction).

- *Transaction*: Representa un pago realizado por el alumno.
    * El campo amount es el monto del pago.
    * El campo fee_id es la cuota a la que pertenece el pago.
    * El campo created_at es la fecha en la que se subió el comprobante.
    * El campo status es el estado del pago (pendiente, aprobado, rechazado).
    * El campo method es el método de pago (efectivo, transferencia).
    * El campo proofImageUrl es la URL de la imagen de prueba del pago (solo para pagos por transferencia).

- *FeeConfig*: Representa la configuración de la cuota.
    * El campo baseAmount es el monto base de la cuota.
    * El campo lateFee es el monto agregado debido a retraso en el pago de la cuota.
    * El campo validFrom es la fecha desde la cual es válida esta configuración.

## Lifecycles
- *Fee lifecycle*
    - PENDING: Es el estado inicial de la cuota. Aquí, paidAmount es 0 y surchargeAmount es 0.
    - * PARTIALLY_PAID: Es el estado de la cuota cuando se ha pagado parcialmente. Aquí, paidAmount > 0 y paidAmount < totalAmount.
    - PAID: Es el estado de la cuota cuando se ha pagado totalmente. Aquí, paidAmount >= totalAmount.

- *Transaction lifecycle*
    - PENDING: Es el estado inicial de la transacción. El comprobante ha sigo cargado por el alumno pero aún el profesor no ha aceptado el pago.
    - APPROVED: Es el estado de la transacción cuando el profesor ha aceptado el pago. Se puede volver a Pending.
    - REJECTED: Es el estado de la transacción cuando el profesor ha rechazado el pago. Se puede volver a Pending.

## Ownership
- PROFESOR
    - Aprueba pagos, indicando el tipo de método de pago
    - Rechaza pagos
    - Ve pagos de sus alumnos

- ALUMNO
    - Puede ver sus cuotas
    - Puede ver sus pagos
    - Puede reportar el pago de sus cuotas

- ADMINISTRADOR
    - Puede modificar la configuración de la cuota.
    - Ver pagos de todos los alumnos

## Rules
- Aprobar pago: Cuando el profesor aprueba un pago, el campo paidAmount se actualiza sumando el monto de la transacción a la cuota correspondiente. Si se ha cubierto el totalAmount de la cuota, el campo status de la cuota cambia a PAID. Si se ha cubierto parcialmente el totalAmount de la cuota, el campo status de la cuota cambia a PARTIALLY_PAID. 
- Revertir aprobación: Cuando el profesor revierte la aprobación de un pago, el campo paidAmount se actualiza restando el monto de la transacción a la cuota correspondiente. Si se ha cubierto parcialmente el totalAmount de la cuota, el campo status de la cuota cambia a PARTIALLY_PAID. Si no se ha cubierto el totalAmount de la cuota, el campo status de la cuota cambia a PENDING.
- Nunca se edita paidAmount directamente. Siempre debe ser el resultado de sumar o restar los montos de las transacciones.

## Invariants
* Fee.paidAmount nunca debe ser negativo.
* Fee.paidAmount nunca debe editarse manualmente.
* Fee.paidAmount debe calcularse únicamente a partir de Transactions APPROVED.
* Una Transaction APPROVED impacta sobre Fee.paidAmount.
* Una Transaction PENDING o REJECTED no impacta sobre Fee.paidAmount.
* Una Fee solo puede pertenecer a un único alumno para un mes y año determinado.
* Un alumno solo puede reportar pagos sobre sus propias cuotas.
* Un profesor solo puede aprobar o rechazar pagos de sus alumnos.

## Derived state
El estado de una Fee depende del valor de paidAmount respecto de totalAmount.
Reglas:
* Si paidAmount == 0:
  status = PENDING
* Si paidAmount > 0 y paidAmount < totalAmount:
  status = PARTIALLY_PAID
* Si paidAmount >= totalAmount:
  status = PAID

## Fee recalculation
Yo haría algo así:

recalculateFee(feeId: number)

Responsabilidades:

Obtener transactions APPROVED
Sumar montos
Actualizar paidAmount
Determinar status
Persistir Fee

## Partial payments
Una Fee puede recibir múltiples pagos parciales.
Los pagos parciales:
* pueden ser aprobados individualmente,
* pueden combinar métodos de pago,
* y contribuyen acumulativamente al paidAmount de la cuota.

## Late fee rules
El recargo por mora se aplica automáticamente después del día configurado por el negocio.
Cuando se aplica:
* surchargeAmount se actualiza.
* totalAmount debe recalcularse.

## Monthly fee generation
Las cuotas deben generarse automáticamente cada mes.
El sistema debe garantizar que:
* cada alumno tenga como máximo una Fee por mes y año,
* y que las cuotas se creen utilizando la FeeConfig vigente al momento de generación.

La generación automática debe:
* asignar baseAmount,
* calcular totalAmount inicial,
* establecer status = PENDING,
* establecer paidAmount = 0.

La restricción:
(studentId, month, year)
debe evitar duplicados.

## Full year payment
El pago anual no representa una entidad financiera separada.

Conceptualmente:
“pagar el año” equivale a cubrir múltiples cuotas mensuales individuales.

El sistema debe permitir:
* registrar pagos que cubran varias cuotas,
* o marcar múltiples Fees como pagadas mediante operaciones administrativas.

FeeStatus NO debe incluir un estado especial FULL_YEAR.

