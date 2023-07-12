import { PROFILE_IDS } from '../constants/bibframe.constants';
import { DEFAULT_RECORD_ID } from '../constants/storage.constants';

// TODO: define default profile that will be used for saving a new record
export const generateRecordBackupKey = (
  profile: string = PROFILE_IDS.MONOGRAPH,
  recordId: number | string = DEFAULT_RECORD_ID,
) => `${profile}:${recordId}`;
