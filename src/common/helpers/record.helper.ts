import { AUTOCLEAR_TIMEOUT } from '@common/constants/storage.constants';
import { localStorageService } from '@common/services/storage';
import { generateRecordBackupKey } from './progressBackup.helper';
import { IDENTIFIER_AS_VALUE, TYPE_URIS } from '@common/constants/bibframe.constants';
import { formatRecord } from './recordFormatting.helper';

export const getRecordId = (record: RecordEntry | null) => record?.resource?.[TYPE_URIS.INSTANCE].id;

export const getRecordWithUpdatedID = (record: RecordEntry, id: RecordID) => ({
  resource: {
    ...record.resource,
    [TYPE_URIS.INSTANCE]: { ...record.resource[TYPE_URIS.INSTANCE], id },
  },
});

export const deleteRecordLocally = (profile: string, recordId?: RecordID) => {
  const storageKey = generateRecordBackupKey(profile, recordId);

  localStorageService.delete(storageKey);
};

export const generateRecordData = (record: ParsedRecord) => {
  return {
    createdAt: new Date().getTime(),
    data: record,
  };
};

export const generateAndSaveRecord = (storageKey: string, record: ParsedRecord) => {
  const newRecord = generateRecordData(record);

  localStorageService.serialize(storageKey, newRecord);

  return newRecord;
};

export const saveRecordLocally = (profile: string, record: ParsedRecord, recordId: RecordID) => {
  const storageKey = generateRecordBackupKey(profile, recordId);
  const formattedRecord = formatRecord(record);
  const updatedRecord = getRecordWithUpdatedID(formattedRecord as RecordEntry, recordId);

  return generateAndSaveRecord(storageKey, updatedRecord as ParsedRecord);
};

export const getSavedRecord = (profile: string, recordId?: RecordID): LocallySavedRecord | null => {
  const storageKey = generateRecordBackupKey(profile, recordId);
  const savedRecordData = localStorageService.deserialize(storageKey);

  if (savedRecordData && !savedRecordData?.data) {
    return generateAndSaveRecord(storageKey, savedRecordData);
  }

  return savedRecordData ? autoClearSavedData(savedRecordData, profile, recordId) : null;
};

export const autoClearSavedData = (savedRecordData: LocallySavedRecord, profile: string, recordId?: RecordID) => {
  const shouldBeCleared = savedRecordData.createdAt + AUTOCLEAR_TIMEOUT <= new Date().getTime();

  if (!shouldBeCleared) return savedRecordData;

  deleteRecordLocally(profile, recordId);

  return null;
};

export const checkIdentifierAsValue = (record: Record<string, string[]>, uri: string) => {
  const identifierAsValueSelection = IDENTIFIER_AS_VALUE[uri];

  if (identifierAsValueSelection) {
    const { field, value } = identifierAsValueSelection;

    if (record?.[field]?.includes(value)) {
      return record;
    }
  }

  return false;
};
