import { useQuery } from '@tanstack/react-query'
import { OrderForm } from 'vtex.order-manager'

import { apiRequest } from '../services'
import type { CompleteOrderForm, CompleteOrderFormData } from '../typings'

const { useOrderForm } = OrderForm

export type UseOrderFormReturn = {
  loading: boolean
  orderForm: CompleteOrderForm
  setOrderForm: (orderForm: CompleteOrderForm) => void
}

export function useOrderFormCustom() {
  const { data, isLoading } = useQuery<CompleteOrderFormData, Error>({
    queryKey: ['invoiceData'],
    queryFn: () =>
      apiRequest<CompleteOrderFormData>(`/api/checkout/pub/orderForm`, 'GET'),
  })

  const {
    orderForm,
    loading,
    setOrderForm,
  } = useOrderForm() as UseOrderFormReturn

  const invoiceAddress = data?.invoiceData?.address
  const shippingAddress = orderForm?.shipping?.selectedAddress

  const isInvoiceSameAsShipping =
    (invoiceAddress?.city ?? '') === (shippingAddress?.city ?? '') &&
    (invoiceAddress?.state ?? '') === (shippingAddress?.state ?? '') &&
    (invoiceAddress?.country ?? '') === (shippingAddress?.country ?? '') &&
    (invoiceAddress?.street ?? '') === (shippingAddress?.street ?? '') &&
    (invoiceAddress?.number ?? '') === (shippingAddress?.number ?? '') &&
    (invoiceAddress?.complement ?? '') ===
      (shippingAddress?.complement ?? '') &&
    (invoiceAddress?.neighborhood ?? '') ===
      (shippingAddress?.neighborhood ?? '') &&
    (invoiceAddress?.postalCode ?? '') === (shippingAddress?.postalCode ?? '')

  const {
    paymentAddress = invoiceAddress && isInvoiceSameAsShipping
      ? shippingAddress
      : invoiceAddress ?? shippingAddress,
  } = orderForm

  return {
    loading: loading || isLoading,
    orderForm: {
      ...data,
      ...orderForm,
      clientProfileData: data?.clientProfileData,
      items: orderForm.items.map((item) => ({
        ...item,
        tax: data?.items.find((i) => i.uniqueId === item.uniqueId)?.tax,
      })),
      paymentAddress,
    },
    setOrderForm,
  }
}
