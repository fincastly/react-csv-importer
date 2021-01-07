import React, { useCallback, useContext, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { File } from '../model/File';
import { TranslationContext } from '../translation/TranslationContext';

import './FileSelector.scss';

export const FileSelector: React.FC<{ onSelected: (file: File) => void }> = ({
  onSelected
}) => {
  const onSelectedRef = useRef(onSelected);
  onSelectedRef.current = onSelected;

  const dropHandler = useCallback((acceptedFiles: File[]) => {
    // silently ignore if nothing to do
    if (acceptedFiles.length < 1) {
      return;
    }

    const file = acceptedFiles[0];
    onSelectedRef.current(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: dropHandler
  });
  const translation = useContext(TranslationContext);

  return (
    <div
      className="CSVImporter_FileSelector"
      data-active={!!isDragActive}
      {...getRootProps()}
    >
      <input {...getInputProps()} />

      {isDragActive ? (
        <span>{translation.dropCsvFilesHere}...</span>
      ) : (
        <span>{translation.dropCsvFilesHereOrClick}</span>
      )}
    </div>
  );
};
