import { Button, ButtonType } from '@components/Button';
import Times16 from '@src/assets/times-16.svg?react';
import { useRecoilValue } from 'recoil';
import state from '@state';
import { getRecordTitle } from '@common/helpers/record.helper';
import { useContainerEvents } from '@common/hooks/useContainerEvents';
import { useIntl } from 'react-intl';

export const PreviewExternalResourcePane = () => {
  const record = useRecoilValue(state.inputs.record);
  const { dispatchNavigateToOriginEventWithFallback } = useContainerEvents();
  const { formatMessage } = useIntl();

  return (
    <div className="nav-block nav-block-fixed-height">
      <nav>
        <Button
          data-testid="nav-close-button"
          type={ButtonType.Icon}
          onClick={dispatchNavigateToOriginEventWithFallback}
          className="nav-close"
          ariaLabel={formatMessage({ id: 'ld.aria.externalResourcePreview.close' })}
        >
          <Times16 />
        </Button>
      </nav>
      <div className="heading">{record && getRecordTitle(record)}</div>
      <span className="empty-block" />
    </div>
  );
};
