import { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { useRecoilState } from 'recoil';
import { getAllRecords, getRecord } from '../../common/api/records.api';
import useConfig from '../../common/hooks/useConfig.hook';
import state from '../../state/state';
import { localStorageService } from '../../common/services/storage';
import { generateRecordBackupKey } from '../../common/helpers/progressBackup.helper';
import { PROFILE_IDS } from '../../common/constants/bibframe.constants';

import './Load.scss';

export const Load = () => {
  const [availableRecords, setAvailableRecords] = useState<Record<string, any> | null>(null);
  const [record, setRecord] = useRecoilState(state.inputs.record);

  const { getProfiles } = useConfig();
  const history = useHistory();

  useEffect(() => {
    getAllRecords({
      pageNumber: 0,
    })
      .then(res => {
        setAvailableRecords(res?.content);
      })
      .catch(err => console.error('Error fetching record list: ', err));
  }, []);

  const fetchRecord = async (recordId: string) => {
    try {
      const profile = record?.profile ?? PROFILE_IDS.MONOGRAPH;
      const storageKey = generateRecordBackupKey(profile, recordId);
      const locallySavedData = localStorageService.deserialize(storageKey);
      let recordData: RecordEntry;

      if (locallySavedData) {
        recordData = { id: recordId, ...locallySavedData[profile] };
      } else {
        recordData = await getRecord({ recordId });
      }

      setRecord(recordData);
      getProfiles(recordData);
      history.push('/edit');
    } catch (err) {
      console.error('Error fetching record: ', err);
    }
  };

  // TODO: Workaroud for demo; define type and format for data received from API
  const generateButtonLabel = ({ id, label }: RecordData) => {
    const labelString = label?.length ? `${label}, ` : '';
    const idString = `Record ID: ${id}`;

    return `${labelString}${idString}`;
  };

  return (
    <div className="load">
      <strong>BIBFRAME Profiles:</strong>
      <div>
        <button>Monograph</button>
      </div>
      <strong>Available records:</strong>
      <div className="button-group">
        {availableRecords?.map(({ id, label }: RecordData) => (
          <button key={id} onClick={() => fetchRecord(String(id))}>
            {generateButtonLabel({ id, label })}
          </button>
        )) || <div>No available records</div>}
      </div>
    </div>
  );
};
