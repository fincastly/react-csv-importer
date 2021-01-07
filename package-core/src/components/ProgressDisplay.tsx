import React, { useState, useEffect, useMemo, useRef, useContext } from 'react';

import {
  processFile,
  PreviewInfo,
  FieldAssignmentMap,
  ParseCallback,
  BaseRow
} from './parser';
import { ImporterFrame } from './ImporterFrame';

import './ProgressDisplay.scss';
import { File } from '../model/File';
import { TranslationContext } from '../translation/TranslationContext';

export interface ImportInfo {
  file: File;
  fields: string[];
}

// compute actual UTF-8 bytes used by a string
// (inspired by https://stackoverflow.com/questions/10576905/how-to-convert-javascript-unicode-notation-code-to-utf-8)
function countUTF8Bytes(item: string) {
  // re-encode into UTF-8
  const escaped = encodeURIComponent(item);

  // convert byte escape sequences into single characters
  const normalized = escaped.replace(/%\d\d/g, '_');

  return normalized.length;
}

export function ProgressDisplay<Row extends BaseRow>({
  preview,
  chunkSize,
  fieldAssignments,
  processChunk,
  onStart,
  onComplete,
  onRestart,
  onClose
}: React.PropsWithChildren<{
  preview: PreviewInfo;
  chunkSize?: number;
  fieldAssignments: FieldAssignmentMap;
  processChunk: ParseCallback<Row>;
  onStart?: (info: ImportInfo) => void;
  onComplete?: (info: ImportInfo) => void;
  onRestart?: () => void;
  onClose?: (info: ImportInfo) => void;
}>): React.ReactElement {
  const [progressCount, setProgressCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isDismissed, setIsDismissed] = useState(false); // prevents double-clicking finish

  const importInfo = useMemo<ImportInfo>(() => {
    return {
      file: preview.file,
      fields: Object.keys(fieldAssignments)
    };
  }, [preview, fieldAssignments]);

  // estimate number of rows
  const estimatedRowCount = useMemo(() => {
    // sum up sizes of all the parsed preview rows and get estimated average
    const totalPreviewRowBytes = preview.firstRows.reduce((prevCount, row) => {
      const rowBytes = row.reduce((prev, item) => {
        return prev + countUTF8Bytes(item) + 1; // add a byte for separator or newline
      }, 0);

      return prevCount + rowBytes;
    }, 0);

    const averagePreviewRowSize =
      totalPreviewRowBytes / preview.firstRows.length;

    // divide file size by estimated row size (or fall back to a sensible amount)
    return averagePreviewRowSize > 1
      ? preview.file.size / averagePreviewRowSize
      : 100;
  }, [preview]);

  // notify on start of processing
  // (separate effect in case of errors)
  const onStartRef = useRef(onStart); // wrap in ref to avoid re-triggering (only first instance is needed)
  useEffect(() => {
    if (onStartRef.current) {
      onStartRef.current(importInfo);
    }
  }, [importInfo]);

  // notify on end of processing
  // (separate effect in case of errors)
  const onCompleteRef = useRef(onComplete); // wrap in ref to avoid re-triggering
  onCompleteRef.current = onComplete;
  useEffect(() => {
    if (isComplete && onCompleteRef.current) {
      onCompleteRef.current(importInfo);
    }
  }, [importInfo, isComplete]);

  // ensure status gets focus when complete, in case status role is not read out
  const statusRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if ((isComplete || error) && statusRef.current) {
      statusRef.current.focus();
    }
  }, [isComplete, error]);

  // perform main async parse
  const chunkSizeRef = useRef(chunkSize); // wrap in ref to avoid re-triggering
  const processChunkRef = useRef(processChunk); // wrap in ref to avoid re-triggering
  const asyncLockRef = useRef<number>(0);
  const translation = useContext(TranslationContext);
  useEffect(() => {
    const oplock = asyncLockRef.current;

    processFile(
      preview.file,
      preview.hasHeaders,
      fieldAssignments,
      (deltaCount) => {
        // ignore if stale
        if (oplock !== asyncLockRef.current) {
          return; // @todo signal abort
        }

        setProgressCount((prev) => prev + deltaCount);
      },
      processChunkRef.current,
      chunkSizeRef.current
    ).then(
      () => {
        // ignore if stale
        if (oplock !== asyncLockRef.current) {
          return;
        }

        setIsComplete(true);
      },
      (error) => {
        // ignore if stale
        if (oplock !== asyncLockRef.current) {
          return;
        }

        setError(error);
      }
    );

    return () => {
      // invalidate current oplock on change or unmount
      asyncLockRef.current += 1;
    };
  }, [preview, fieldAssignments]);

  // simulate asymptotic progress percentage
  const progressPercentage = useMemo(() => {
    if (isComplete) {
      return 100;
    }

    // inputs hand-picked so that correctly estimated total is about 75% of the bar
    const progressPower = 2.5 * (progressCount / estimatedRowCount);
    const progressLeft = 0.5 ** progressPower;

    // convert to .1 percent precision for smoother bar display
    return Math.floor(1000 - 1000 * progressLeft) / 10;
  }, [estimatedRowCount, progressCount, isComplete]);

  return (
    <ImporterFrame
      fileName={preview.file.name}
      subtitle={translation.import}
      error={error && (error.message || error.toString())}
      secondaryDisabled={!isComplete || isDismissed}
      secondaryLabel={onRestart && onClose ? translation.uploadMore : undefined}
      onSecondary={onRestart && onClose ? onRestart : undefined}
      nextDisabled={(!onClose && !onRestart) || !isComplete || isDismissed}
      nextLabel={
        !onClose && onRestart ? translation.uploadMore : translation.finish
      }
      onNext={() => {
        setIsDismissed(true);

        if (onClose) {
          onClose(importInfo);
        } else if (onRestart) {
          onRestart();
        }
      }}
    >
      <div className="CSVImporter_ProgressDisplay">
        {isComplete || error ? (
          <div
            className="CSVImporter_ProgressDisplay__status"
            role="status"
            tabIndex={-1}
            ref={statusRef}
          >
            {error ? translation.couldNotImport : translation.complete}
          </div>
        ) : (
          <div
            className="CSVImporter_ProgressDisplay__status -pending"
            role="status"
          >
            {translation.importing}...
          </div>
        )}

        <div className="CSVImporter_ProgressDisplay__count" role="text">
          <var>{translation.processedRows}:</var> {progressCount}
        </div>

        <div className="CSVImporter_ProgressDisplay__progressBar">
          <div
            className="CSVImporter_ProgressDisplay__progressBarIndicator"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
    </ImporterFrame>
  );
}
