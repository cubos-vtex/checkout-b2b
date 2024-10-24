import React from 'react'
import { useIntl } from 'react-intl'
import { FormattedPrice } from 'vtex.formatted-price'

import { PaymentData } from '../components/PaymentData'
import { PONumber } from '../components/PONumber'
import { TruncatedText } from '../components/TruncatedText'
import { messages } from '../utils'
import { useOrderFormCustom } from './useOrderFormCustom'

export function useTotalizers() {
  const { formatMessage } = useIntl()
  const { orderForm } = useOrderFormCustom()
  const total = orderForm.value ?? 0
  const totalizers = orderForm.totalizers ?? []

  if (!totalizers.length || !orderForm.items?.length) return []

  return [
    {
      label: formatMessage(messages.paymentMethods),
      value: <PaymentData />,
    },
    {
      label: formatMessage(messages.PONumber),
      value: <PONumber />,
    },
    ...totalizers.map((t) => ({
      label: t.name,
      value: <TruncatedText text={<FormattedPrice value={t.value / 100} />} />,
    })),
    {
      label: formatMessage(messages.total),
      value: <TruncatedText text={<FormattedPrice value={total / 100} />} />,
    },
  ]
}
