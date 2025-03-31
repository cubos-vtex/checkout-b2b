import React, {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useQuery } from 'react-apollo'
import { useIntl } from 'react-intl'
import { AutocompleteInput, Spinner } from 'vtex.styleguide'

import { useCheckoutB2BContext } from '../CheckoutB2BContext'
import SEARCH_PRODUCTSS from '../graphql/getProducts.graphql'
import { useDebounce, useOrderFormCustom } from '../hooks'
import { useAddItems } from '../hooks/useAddItems'
import { removeAccents, SEARCH_TYPE } from '../utils'
import { messages } from '../utils/messages'

interface CommertialOffer {
  Price: number
}

interface Seller {
  sellerId: string
  commertialOffer: CommertialOffer
}

interface Item {
  itemId: string
  name: string
  sellers: Seller[]
}

interface Product {
  productId: string
  productName: string
  items: Item[]
}

interface ProductsResponse {
  products: Product[]
}

type CustomOptionProps = {
  searchTerm: string
  value: { label: string; item: Item; type?: 'product' | 'sku' }
  selected: boolean
  inserted: boolean
  handleAddItem: (item: Item | Item[]) => void
}

const ProductAutocomplete = () => {
  const { formatMessage } = useIntl()
  const { searchStore, searchQuery, setSearchQuery } = useCheckoutB2BContext()
  const setSearchQueryDebounced = useDebounce(setSearchQuery, 1000)
  const { orderForm } = useOrderFormCustom()

  const orderFormHasItem = useCallback(
    (item: Item) =>
      orderForm.items.some(
        (i) => i.id === item.itemId && i.seller === item.sellers[0].sellerId
      ),
    [orderForm.items]
  )

  const {
    data,
    error: queryError,
    loading: queryLoading,
    networkStatus,
  } = useQuery<ProductsResponse>(SEARCH_PRODUCTSS, {
    variables: { query: searchQuery },
    skip: !searchStore || !searchQuery,
  })

  const [addItemsMutation, { error: mutationError }] = useAddItems()

  const handleSearchChange = useCallback(
    (term: string) => {
      setSearchQueryDebounced(term)
    },
    [setSearchQueryDebounced]
  )

  const itemsOptions = React.useMemo(() => {
    if (!data?.products) return []

    const options: Array<{
      label: string
      value: string
      item: Item | Item[]
      type: 'product' | 'sku'
    }> = []

    data.products.forEach((product) => {
      options.push({
        label: `${product.productName} `,
        value: `product-${product.productId}`,
        item: product.items,
        type: 'product',
      })

      product.items.forEach((item) => {
        options.push({
          label: `${product.productName} - ${item.name}`,
          value: item.itemId,
          item,
          type: 'sku',
        })
      })
    })

    return options
  }, [data?.products])

  const rootRef = useRef<HTMLDivElement>(null)

  const handleAddItem = useCallback(
    (item: Item | Item[]) => {
      const items = Array.isArray(item) ? item : [item]

      const validItems = items.filter((i) => i?.sellers && i.sellers.length > 0)

      if (validItems.length === 0) {
        console.error('Nenhum seller disponível para os itens:', items)

        return
      }

      rootRef.current?.querySelector('input')?.focus()

      addItemsMutation({
        variables: {
          items: validItems.map((validItem) => ({
            id: Number(validItem.itemId),
            quantity: 1,
            seller: validItem.sellers[0].sellerId,
          })),
        },
      })
    },
    [addItemsMutation, rootRef]
  )

  const isEmpty = networkStatus === 7 && !itemsOptions.length

  const options = {
    onSelect: () => {},
    size: 'small',
    loading: queryLoading,
    maxHeight: 400,
    renderOption: function RenderOption(props: CustomOptionProps) {
      if (!props.value) return null

      const allItemsInserted = Array.isArray(props.value.item)
        ? props.value.item.every((item) => orderFormHasItem(item))
        : orderFormHasItem(props.value.item)

      return (
        <CustomOption
          {...props}
          {...(props.value.item && { inserted: allItemsInserted })}
          handleAddItem={handleAddItem}
        />
      )
    },
    value: itemsOptions,
    ...(isEmpty && {
      customMessage: formatMessage(messages.searchProductsEmpty, {
        term: searchQuery,
        type: SEARCH_TYPE.STORE,
      }),
    }),
  }

  const input = {
    onChange: handleSearchChange,
    onClear: () => setSearchQuery(''),
    placeholder: formatMessage(messages.searchProductsPlaceholder),
    value: searchQuery,
    className: 't-body w-100 ph5 b--none outline-0',
  }

  if (queryError) {
    console.error('Erro na query:', queryError)
  }

  if (mutationError) {
    console.error('Erro na mutation:', mutationError)
  }

  useEffect(() => {
    if (searchStore) {
      rootRef.current?.querySelector('input')?.focus()
    }
  }, [searchStore])

  if (!searchStore) return null

  return (
    <div ref={rootRef}>
      <AutocompleteInput input={input} options={options} />
    </div>
  )
}

function CustomOption(props: CustomOptionProps) {
  const { searchTerm, value, selected, inserted, handleAddItem } = props
  const [highlightOption, setHighlightOption] = useState(false)
  const [loading, setLoading] = useState(false)
  const wrapperRef = useRef<HTMLButtonElement>(null)
  const { label, type } = value
  const searchWords = searchTerm.trim().split(/\s+/).filter(Boolean)
  const labelSplitted = label.split(/\s+/)
  const highlightedLabel = labelSplitted.map((part, index) => (
    <Fragment key={index}>
      {searchWords.some(
        (word) => removeAccents(word) === removeAccents(part)
      ) ? (
        <span className="fw7">{part}</span>
      ) : (
        part
      )}
      {index < labelSplitted.length - 1 && ' '}
    </Fragment>
  ))

  const buttonClasses = `bn w-100 tl pointer pa4 f6 outline-0 ${
    selected || (highlightOption && !inserted) ? 'bg-muted-5' : 'bg-base'
  }${inserted ? ' strike' : ''}${type === 'product' ? ' b--primary bw1' : ''}`

  useEffect(() => {
    if (selected) {
      wrapperRef.current?.focus()
    }
  }, [selected])

  return (
    <button
      ref={wrapperRef}
      className={buttonClasses}
      onFocus={() => setHighlightOption(true)}
      onBlur={() => setHighlightOption(false)}
      onMouseEnter={() => setHighlightOption(true)}
      onMouseLeave={() => setHighlightOption(false)}
      onClick={() => {
        if (inserted || loading) return

        setLoading(true)
        handleAddItem(value.item)
        setLoading(false)
      }}
    >
      <div className="flex flex-wrap items-center">
        <span className="truncate">
          {type === 'product' && '📦 '}
          {highlightedLabel}
        </span>
        {loading && !inserted && <Spinner size={16} />}
      </div>
    </button>
  )
}

export default ProductAutocomplete
