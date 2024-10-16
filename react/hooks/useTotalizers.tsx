import React from 'react'
import { useIntl } from 'react-intl'
import type { OrderForm } from 'vtex.checkout-graphql'
import { FormattedPrice } from 'vtex.formatted-price'

import { PaymentData } from '../components/PaymentData'
import { PONumber } from '../components/PONumber'
import { TruncatedText } from '../components/TruncatedText'
import { messages } from '../utils'

export function useTotalizers(form: Partial<OrderForm>) {
  const { formatMessage } = useIntl()
  const total = form.value ?? 0
  const totalizers = form.totalizers ?? []

  if (!totalizers.length) return null

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
