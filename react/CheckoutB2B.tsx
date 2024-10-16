import React, { useCallback } from 'react'
import { useIntl } from 'react-intl'
import { useCssHandles } from 'vtex.css-handles'
import { OrderItems } from 'vtex.order-items'
import { ExtensionPoint, useRuntime } from 'vtex.render-runtime'
import {
  Button,
  Layout,
  PageBlock,
  PageHeader,
  Table,
  ToastProvider,
} from 'vtex.styleguide'
import './styles.css'

import { ContactInfos } from './components/ContactInfos'
import { useOrderFormCustom, useTableSchema, useTotalizers } from './hooks'
import { useOrganization } from './hooks/useOrganization'
import { messages } from './utils'

function CheckoutB2B() {
  const handles = useCssHandles(['container', 'table'])
  const { organization, loading: organizationLoading } = useOrganization()
  const {
    loading: orderFormLoading,
    orderForm,
    setOrderForm,
  } = useOrderFormCustom()

  const loading = orderFormLoading || organizationLoading
  const { useOrderItems } = OrderItems
  const { items } = orderForm
  const mappedTotalizers = useTotalizers(orderForm)
  const schema = useTableSchema()

  const { navigate } = useRuntime()
  const { formatMessage } = useIntl()
  const { removeItem } = useOrderItems()

  const handleClearCart = useCallback(() => {
    items.forEach(({ id, seller }) => removeItem({ id, seller: seller ?? '1' }))
    setOrderForm({
      ...orderForm,
      items: [],
      totalizers: [],
    })
  }, [items, orderForm, removeItem, setOrderForm])

  // eslint-disable-next-line no-console
  console.log('ORDER FORM:', orderForm)

  return (
    <ToastProvider positioning="window">
      <div className={handles.container}>
        <Layout
          fullWidth
          pageHeader={
            <PageHeader
              title={<ExtensionPoint id="rich-text" />}
              linkLabel={formatMessage(messages.backToHome)}
              onLinkClick={() => navigate({ page: 'store.home' })}
            />
          }
        >
          <PageBlock>
            {!loading && <ContactInfos organization={organization} />}
            <div className={handles.table}>
              <Table
                totalizers={!loading && mappedTotalizers}
                loading={loading}
                fullWidth
                schema={schema}
                items={items}
                density="high"
                emptyStateLabel={formatMessage(messages.emptyCart)}
              />
            </div>
          </PageBlock>

          {!!items.length && !loading && (
            <Button variation="danger-tertiary" onClick={handleClearCart}>
              {formatMessage(messages.clearCart)}
            </Button>
          )}
        </Layout>
      </div>
    </ToastProvider>
  )
}

export default CheckoutB2B
