import React, { useContext } from 'react';
import { TranslationContext } from '../translation/TranslationContext';

import { FormatErrorMessage } from './FormatErrorMessage';

import './FormatRawPreview.scss';

const RAW_PREVIEW_SIZE = 500;

export const FormatRawPreview: React.FC<{
  chunk: string;
  warning?: Papa.ParseError;
  onCancelClick: () => void;
  // eslint-disable-next-line react/display-name
}> = React.memo(({ chunk, warning, onCancelClick }) => {
  const chunkSlice = chunk.slice(0, RAW_PREVIEW_SIZE);
  const chunkHasMore = chunk.length > RAW_PREVIEW_SIZE;
  const translation = useContext(TranslationContext);

  return (
    <div className="CSVImporter_FormatRawPreview">
      <div className="CSVImporter_FormatRawPreview__scroll">
        <pre className="CSVImporter_FormatRawPreview__pre">
          {chunkSlice}
          {chunkHasMore && <aside>...</aside>}
        </pre>
      </div>

      {warning ? (
        <FormatErrorMessage onCancelClick={onCancelClick}>
          {warning.message}: {translation.checkDataFormatting}
        </FormatErrorMessage>
      ) : null}
    </div>
  );
});
