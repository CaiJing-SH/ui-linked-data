import { FC, memo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Modal } from '@components/Modal';
import './ModalCloseRecord.scss';

interface Props {
  isOpen: boolean;
  onCancel: VoidFunction;
  onSubmit: VoidFunction;
  onClose: VoidFunction;
}

export const ModalCloseRecord: FC<Props> = memo(({ isOpen, onCancel, onSubmit, onClose }) => {
  const { formatMessage } = useIntl();

  return (
    <Modal
      isOpen={isOpen}
      title={formatMessage({ id: 'marva.closeRd' })}
      submitButtonLabel={formatMessage({ id: 'marva.no' })}
      cancelButtonLabel={formatMessage({ id: 'marva.yes' })}
      onClose={onClose}
      onSubmit={onSubmit}
      onCancel={onCancel}
    >
      <div className="close-record-contents" data-testid="modal-close-record-content">
        <FormattedMessage id="marva.confirmCloseRd" />
      </div>
    </Modal>
  );
});
