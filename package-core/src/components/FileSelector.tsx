import React, { useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';

import './FileSelector.scss';

export type DropzoneOptionsOverride = {
  accept?: string | string[];
  minSize?: number;
  maxSize?: number;
  preventDropOnDocument?: boolean;
  noClick?: boolean;
  noKeyboard?: boolean;
  noDrag?: boolean;
  noDragEventsBubbling?: boolean;
  disabled?: boolean;
};

type FileSelectorProps = {
  onSelected: (file: File) => void;
  dropzoneOptions?: DropzoneOptionsOverride;
};

export const FileSelector: React.FC<FileSelectorProps> = ({
  onSelected,
  dropzoneOptions
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
    ...dropzoneOptions,
    onDrop: dropHandler
  });

  return (
    <div
      className="CSVImporter_FileSelector"
      data-active={!!isDragActive}
      {...getRootProps()}
    >
      <input {...getInputProps()} />

      {isDragActive ? (
        <span>Drop CSV file here...</span>
      ) : (
        <span>Drag-and-drop CSV file here, or click to select in folder</span>
      )}
    </div>
  );
};
