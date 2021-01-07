import React, { useState, useCallback, useEffect, useContext } from 'react';

import {
  PreviewInfo,
  FieldAssignmentMap,
  ParseCallback,
  BaseRow
} from './parser';
import { FileSelector } from './FileSelector';
import { FormatPreview } from './FormatPreview';
import { ColumnPicker, Field } from './ColumnPicker';
import { ProgressDisplay, ImportInfo } from './ProgressDisplay';

import './Importer.scss';
import { TranslationContext } from '../translation/TranslationContext';
import { DEFAULT_TRANSLATION, Translation } from '../translation/Translation';

export interface ImporterFieldProps {
  name: string;
  label: string;
  optional?: boolean;
}

export interface ImporterProps<Row extends BaseRow> {
  chunkSize?: number;
  assumeNoHeaders?: boolean;
  restartable?: boolean;
  processChunk: ParseCallback<Row>;
  translations?: Translation;
  onStart?: (info: ImportInfo) => void;
  onComplete?: (info: ImportInfo) => void;
  onClose?: (info: ImportInfo) => void;
}

type FieldListSetter = (prev: Field[]) => Field[];

const FieldDefinitionContext = React.createContext<
  ((setter: FieldListSetter) => void) | null
>(null);

export const ImporterField: React.FC<ImporterFieldProps> = ({
  name,
  label,
  optional
}) => {
  const fieldSetter = useContext(FieldDefinitionContext);

  // update central list as needed
  useEffect(() => {
    if (!fieldSetter) {
      console.error('importer field must be a child of importer'); // @todo
      return;
    }

    fieldSetter((prev) => {
      const newField = { name, label, isOptional: !!optional };

      const copy = [...prev];
      const existingIndex = copy.findIndex((item) => item.name === name);

      // preserve existing array position if possible
      if (existingIndex === -1) {
        copy.push(newField);
      } else {
        copy[existingIndex] = newField;
      }

      return copy;
    });
  }, [fieldSetter, name, label, optional]);

  return null;
};

function ImporterCore<Row extends BaseRow>({
  fields,
  chunkSize,
  assumeNoHeaders,
  restartable,
  processChunk,
  onStart,
  onComplete,
  onClose
}: React.PropsWithChildren<
  ImporterProps<Row> & {
    fields: Field[];
  }
>) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [preview, setPreview] = useState<PreviewInfo | null>(null);
  const [editFormat, setEditFormat] = useState<boolean>(false);

  const [
    fieldAssignments,
    setFieldAssignments
  ] = useState<FieldAssignmentMap | null>(null);

  const fileHandler = useCallback((file: File) => {
    setSelectedFile(file);
  }, []);

  if (selectedFile === null) {
    return <FileSelector onSelected={fileHandler} />;
  }

  if (preview === null || editFormat) {
    return (
      <FormatPreview
        file={selectedFile}
        assumeNoHeaders={assumeNoHeaders}
        currentPreview={preview}
        onAccept={(parsedPreview) => {
          setPreview(parsedPreview);
          setEditFormat(false);
        }}
        onCancel={() => {
          setSelectedFile(null);
        }}
      />
    );
  }

  if (fieldAssignments === null) {
    return (
      <ColumnPicker
        fields={fields}
        preview={preview}
        onAccept={(assignments) => {
          setFieldAssignments(assignments);
        }}
        onCancel={() => {
          // keep existing preview data
          setEditFormat(true);
        }}
      />
    );
  }

  return (
    <ProgressDisplay
      preview={preview}
      fieldAssignments={fieldAssignments}
      chunkSize={chunkSize}
      processChunk={processChunk}
      onStart={onStart}
      onRestart={
        restartable
          ? () => {
              // reset all state
              setSelectedFile(null);
              setPreview(null); // not bothering with editFormat flag
              setFieldAssignments(null);
            }
          : undefined
      }
      onComplete={onComplete}
      onClose={onClose}
    />
  );
}

export function Importer<Row extends BaseRow>({
  children,
  ...props
}: React.PropsWithChildren<ImporterProps<Row>>): React.ReactElement {
  const [fields, setFields] = useState<Field[]>([]);

  return (
    <TranslationContext.Provider
      value={
        props.translations
          ? { ...DEFAULT_TRANSLATION, ...props.translations }
          : DEFAULT_TRANSLATION
      }
    >
      <div className="CSVImporter_Importer">
        <ImporterCore fields={fields} {...props} />

        <FieldDefinitionContext.Provider value={setFields}>
          {children}
        </FieldDefinitionContext.Provider>
      </div>
    </TranslationContext.Provider>
  );
}
