import { BF2_TO_BFLITE_MAP } from '@common/constants/bibframeMapping.constants';

export const getMappedBFLiteUri = (uri: string | undefined, schema?: Schema, path?: string[]) => {
  if (!uri || !BF2_TO_BFLITE_MAP[uri]) return undefined;

  const mappedUri = BF2_TO_BFLITE_MAP[uri];
  const uriType = typeof mappedUri;

  if (uriType === 'string') {
    return BF2_TO_BFLITE_MAP[uri] as string;
  } else if (uriType === 'object') {
    let updatedUri;

    path?.forEach(elem => {
      const schemaElem = schema?.get(elem);

      if (!schemaElem || !schemaElem.uri) return;

      const mappedUriTyped = mappedUri as BFMapEntry;
      const schemaElemUri = schemaElem.uri as string;
      const pathUri = mappedUriTyped?.[schemaElemUri];

      if (pathUri) {
        updatedUri = pathUri;
      }
    });

    return updatedUri;
  }
};

export const getUris = (uri: string, schema?: Schema, path?: string[]) => {
  const uriBFLite = getMappedBFLiteUri(uri, schema, path);
  const uriWithSelector = uriBFLite || uri;

  return { uriBFLite, uriWithSelector };
};
