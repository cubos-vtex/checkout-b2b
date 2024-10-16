import type { OrderForm as OrderFormType } from 'vtex.checkout-graphql'
import { OrderForm } from 'vtex.order-manager'

type UseOrderFormReturn = {
  loading: boolean
  orderForm: OrderFormType
  setOrderForm: (orderForm: OrderFormType) => void
}

export function useOrderFormCustom() {
  const { useOrderForm } = OrderForm

  return useOrderForm() as UseOrderFormReturn
}
