import React, { useCallback } from 'react'
import { useIntl } from 'react-intl'
import { Button, EXPERIMENTAL_Modal as Modal } from 'vtex.styleguide'

import { messages } from '../utils'
import { SavedCartsTable } from './SavedCardTable'

export function SavedCartsListModal({
  open,
  setOpen,
}: {
  open: boolean
  setOpen: (value: boolean) => void
}) {
  const { formatMessage } = useIntl()

  const handleCloseModal = useCallback(() => {
    setOpen(false)
  }, [setOpen])

  return (
    <Modal
      isOpen={open}
      onClose={handleCloseModal}
      centered
      size="large"
      title={formatMessage(messages.savedCartsTitle)}
    >
      <div className="mb5">
        <SavedCartsTable />
      </div>
      <div className="flex justify-end">
        <Button onClick={handleCloseModal}>
          {formatMessage(messages.cancel)}
        </Button>
      </div>
    </Modal>
  )
}
