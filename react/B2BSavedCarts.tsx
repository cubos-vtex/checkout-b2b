import { QueryClientProvider } from '@tanstack/react-query'
import React, { useEffect } from 'react'
import { useIntl } from 'react-intl'
import { ExtensionPoint, useRuntime } from 'vtex.render-runtime'
import { Layout, PageBlock, PageHeader, ToastProvider } from 'vtex.styleguide'

import { CheckoutB2BProvider } from './CheckoutB2BContext'
import { SavedCartsTable } from './components/SavedCartTable'
import { queryClient } from './services'
import { messages, welcome } from './utils'

export default function B2BSavedCarts() {
  useEffect(welcome, [])
  const { formatMessage } = useIntl()
  const { navigate } = useRuntime()

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider positioning="window">
        <CheckoutB2BProvider>
          <Layout
            fullWidth
            pageHeader={
              <PageHeader
                title={<ExtensionPoint id="rich-text" />}
                linkLabel={formatMessage(messages.backToHome)}
                onLinkClick={() =>
                  navigate({
                    page: 'store.home',
                    fallbackToWindowLocation: true,
                  })
                }
              />
            }
          >
            <PageBlock>
              <SavedCartsTable />
            </PageBlock>
          </Layout>
        </CheckoutB2BProvider>
      </ToastProvider>
    </QueryClientProvider>
  )
}
