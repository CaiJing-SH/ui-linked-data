import { AdvancedFieldType } from '@common/constants/uiControls.constants';
import {
  BFLITE_LABELS_MAP,
  BFLITE_URIS,
  ADVANCED_FIELDS,
  NON_BF_GROUP_TYPE,
} from '@common/constants/bibframeMapping.constants';
import { PREV_ENTRY_PATH_INDEX } from '@common/constants/bibframe.constants';
import { RecordNormalizingService } from '@common/services/recordNormalizing';
import { RecordToSchemaMappingService } from '@common/services/recordToSchemaMapping';

type IGetSchemaAndUserValuesFromRecord = {
  base: Map<string, SchemaEntry>;
  record: RecordEntry;
  block?: string;
  reference?: RecordReference;
  recordBlocks: RecordBlocksList;
  selectedEntriesService: ISelectedEntries;
  schemaWithDuplicatesService: ISchemaWithDuplicates;
  userValuesService: IUserValues;
  commonStatusService: ICommonStatus;
  template?: ResourceTemplateMetadata[];
};

// TODO: this code should be refactored
// As per https://github.com/FOLIO-EIS/ui-linked-data/pull/307/files#r1732589599
export const getSchemaAndUserValuesFromRecord = async ({
  base,
  record,
  block,
  reference,
  recordBlocks,
  selectedEntriesService,
  schemaWithDuplicatesService,
  userValuesService,
  commonStatusService,
  template,
}: IGetSchemaAndUserValuesFromRecord) => {
  const recordNormalizingService = new RecordNormalizingService(record, block, reference);
  const normalizedRecord = recordNormalizingService.get();
  const recordToSchemaMappingService = new RecordToSchemaMappingService(
    base,
    normalizedRecord as RecordEntry,
    recordBlocks as RecordBlocksList,
    selectedEntriesService,
    schemaWithDuplicatesService,
    userValuesService,
    commonStatusService,
    template,
  );

  await recordToSchemaMappingService.init();

  return {
    updatedSchema: recordToSchemaMappingService.getUpdatedSchema(),
    updatedUserValues: userValuesService.getAllValues(),
  };
};

export const getLookupLabelKey = (uriBFLite?: string) => {
  const typedUriBFLite = uriBFLite as keyof typeof BFLITE_LABELS_MAP;

  return uriBFLite ? BFLITE_LABELS_MAP[typedUriBFLite] || BFLITE_URIS.LABEL : BFLITE_URIS.TERM;
};

export const getAdvancedValuesField = (uriBFLite?: string) => {
  const typedUriBFLite = uriBFLite as keyof typeof ADVANCED_FIELDS;

  return uriBFLite ? ADVANCED_FIELDS[typedUriBFLite]?.valueUri : undefined;
};

export const generateAdvancedFieldObject = ({
  advancedValueField,
  label,
}: {
  advancedValueField?: string;
  label?: string;
}) => (advancedValueField && label ? { [advancedValueField]: [label] } : undefined);

export const hasChildEntry = (schema: Map<string, SchemaEntry>, children?: string[]) => {
  if (!children) return false;

  return children.reduce((accum, current) => {
    if (accum) return accum;

    accum = !!schema.get(current);

    return accum;
  }, false);
};

export const getMappedNonBFGroupType = (propertyURI?: string) => {
  if (!propertyURI || !NON_BF_GROUP_TYPE[propertyURI]) return undefined;

  return NON_BF_GROUP_TYPE[propertyURI] as unknown as NonBFMappedGroupData;
};

export const checkGroupIsNonBFMapped = ({
  propertyURI,
  parentEntryType,
  type,
}: {
  propertyURI?: string;
  parentEntryType?: AdvancedFieldType;
  type: AdvancedFieldType;
}) => {
  const { block, groupComplex } = AdvancedFieldType;
  const mappedGroup = getMappedNonBFGroupType(propertyURI);

  return !!mappedGroup && parentEntryType === block && type === groupComplex;
};

export const getRecordEntry = (recordEntry?: Record<string, Record<string, string[]>[]>) =>
  Array.isArray(recordEntry) ? recordEntry[0] : recordEntry;

export const selectNonBFMappedGroupData = ({
  propertyURI,
  type,
  parentEntryType,
  selectedRecord,
}: {
  propertyURI: string;
  type: AdvancedFieldType;
  parentEntryType?: AdvancedFieldType;
  selectedRecord?: Record<string, Record<string, string[]>[]> | Record<string, Record<string, string[]>[]>;
}) => {
  const mappedGroup = getMappedNonBFGroupType(propertyURI);
  const isNonBFMappedGroup = checkGroupIsNonBFMapped({ propertyURI, parentEntryType, type });
  const recordEntry = getRecordEntry(selectedRecord);
  const selectedNonBFRecord =
    isNonBFMappedGroup && mappedGroup && mappedGroup?.container?.key
      ? recordEntry?.[mappedGroup.container.key]
      : undefined;
  const nonBFMappedGroup = isNonBFMappedGroup
    ? {
        uri: propertyURI,
        data: mappedGroup,
      }
    : undefined;

  return { selectedNonBFRecord, nonBFMappedGroup };
};

export const findParentEntryByProperty = <T>({
  schema,
  path,
  key,
  value,
}: {
  schema: Schema;
  path: string[];
  key: keyof SchemaEntry;
  value: T;
}) =>
  path.reduce(
    (accum, pathItem) => {
      const schemaElem = schema.get(pathItem);
      const hasCorrectValue = schemaElem?.[key] === value;

      if (hasCorrectValue) {
        accum = schemaElem;
      }

      return accum;
    },
    null as SchemaEntry | null,
  );

export const normalizeLayoutProperty = (layout?: PropertyLayout<string>) => {
  if (!layout) return;

  const normalizedLayout = { ...layout } as unknown as PropertyLayout<boolean>;

  if (layout?.readOnly) {
    normalizedLayout.readOnly = Boolean(layout?.readOnly);
  }

  if (layout?.isNew) {
    normalizedLayout.isNew = Boolean(layout.isNew);
  }

  return normalizedLayout;
};

export const getParentEntryUuid = (path: string[]) => {
  const index = path.length - PREV_ENTRY_PATH_INDEX;
  const parentEntryIndex = index >= 0 ? index : 0;

  return path[parentEntryIndex];
};

export const getAssociatedControlledByEntry = (
  schema: Schema,
  parentEntryChildren?: string[],
  dependsOnId?: string,
) => {
  let controlledByEntry: SchemaEntry | undefined;

  parentEntryChildren?.forEach(entry => {
    if (controlledByEntry) return;

    const childEntry = schema.get(entry);

    if (childEntry?.bfid === dependsOnId) {
      controlledByEntry = childEntry;
    }
  });

  return controlledByEntry;
};

export const getUdpatedAssociatedEntries = ({
  schema,
  dependentEntry,
  parentEntryChildren,
  dependsOnId,
}: {
  schema: Schema;
  dependentEntry: SchemaEntry;
  parentEntryChildren?: string[];
  dependsOnId?: string;
}) => {
  const constolledByEntry = getAssociatedControlledByEntry(schema, parentEntryChildren, dependsOnId) as
    | SchemaEntry
    | undefined;
  const updatedConstolledByEntry = { ...constolledByEntry };
  const updatedDependentEntry = { ...dependentEntry };

  if (constolledByEntry) {
    updatedConstolledByEntry.linkedEntry = { dependent: updatedDependentEntry.uuid };
    updatedDependentEntry.linkedEntry = { controlledBy: updatedConstolledByEntry.uuid };
  }

  return { controlledByEntry: updatedConstolledByEntry, dependentEntry: updatedDependentEntry };
};
