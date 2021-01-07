import React, { useState, useMemo, useContext } from 'react';
import { useDrag } from 'react-use-gesture';

import { FieldAssignmentMap } from './parser';
import { DragState } from './ColumnDragState';
import { ColumnDragCard, Column } from './ColumnDragCard';
import { IconButton } from './IconButton';

import './ColumnDragSourceArea.scss';
import { TranslationContext } from '../translation/TranslationContext';

const SOURCES_PAGE_SIZE = 5; // fraction of 10 for easier counting

// @todo readable status text if not mouse-drag
const SourceBox: React.FC<{
  hasHeaders: boolean;
  column: Column;
  fieldAssignments: FieldAssignmentMap;
  dragState: DragState | null;
  eventBinder: (column: Column) => ReturnType<typeof useDrag>;
  onSelect: (column: Column) => void;
  onUnassign: (column: Column) => void;
}> = ({
  hasHeaders,
  column,
  fieldAssignments,
  dragState,
  eventBinder,
  onSelect,
  onUnassign
}) => {
  const isDragged = dragState ? column === dragState.column : false;

  const isAssigned = useMemo(
    () =>
      Object.keys(fieldAssignments).some(
        (fieldName) => fieldAssignments[fieldName] === column.index
      ),
    [fieldAssignments, column]
  );

  const eventHandlers = useMemo(() => eventBinder(column), [
    eventBinder,
    column
  ]);
  const translation = useContext(TranslationContext);

  return (
    <div className="CSVImporter_ColumnDragSourceArea__box">
      <div {...(isAssigned ? {} : eventHandlers)}>
        <ColumnDragCard
          hasHeaders={hasHeaders}
          column={column}
          isShadow={isDragged || isAssigned}
          isDraggable={!dragState && !isDragged && !isAssigned}
        />
      </div>

      {/* tab order after column contents */}
      <div className="CSVImporter_ColumnDragSourceArea__boxAction">
        {isAssigned ? (
          <IconButton
            key="clear" // key-prop helps clear focus on click
            label={translation.clearColumnAssignment}
            small
            type="replay"
            onClick={() => {
              onUnassign(column);
            }}
          />
        ) : (
          <IconButton
            key="dragSelect" // key-prop helps clear focus on click
            focusOnly
            label={
              dragState && dragState.column === column
                ? translation.unselectColumn
                : translation.selectColumnForAssignment
            }
            small
            type="back"
            onClick={() => {
              onSelect(column);
            }}
          />
        )}
      </div>
    </div>
  );
};

// @todo current page indicator (dots)
export const ColumnDragSourceArea: React.FC<{
  hasHeaders: boolean;
  columns: Column[];
  fieldAssignments: FieldAssignmentMap;
  dragState: DragState | null;
  eventBinder: (column: Column) => ReturnType<typeof useDrag>;
  onSelect: (column: Column) => void;
  onUnassign: (column: Column) => void;
}> = ({
  hasHeaders,
  columns,
  fieldAssignments,
  dragState,
  eventBinder,
  onSelect,
  onUnassign
}) => {
  const [page, setPage] = useState<number>(0);
  const [pageChanged, setPageChanged] = useState<boolean>(false);
  const pageCount = Math.ceil(columns.length / SOURCES_PAGE_SIZE);

  const start = page * SOURCES_PAGE_SIZE;
  const pageContents = columns
    .slice(start, start + SOURCES_PAGE_SIZE)
    .map((column, columnIndex) => (
      <SourceBox
        key={columnIndex}
        hasHeaders={hasHeaders}
        column={column}
        fieldAssignments={fieldAssignments}
        dragState={dragState}
        eventBinder={eventBinder}
        onSelect={onSelect}
        onUnassign={onUnassign}
      />
    ));

  while (pageContents.length < SOURCES_PAGE_SIZE) {
    pageContents.push(
      <div
        key={pageContents.length}
        className="CSVImporter_ColumnDragSourceArea__pageFiller"
      />
    );
  }
  const translation = useContext(TranslationContext);

  return (
    <section
      className="CSVImporter_ColumnDragSourceArea"
      aria-label="Columns to import"
    >
      <div className="CSVImporter_ColumnDragSourceArea__control">
        <IconButton
          label={translation.showPreviousColumns}
          type="back"
          disabled={page === 0}
          onClick={() => {
            setPage((prev) => Math.max(0, prev - 1));
            setPageChanged(true);
          }}
        />
      </div>
      <div className="CSVImporter_ColumnDragSourceArea__page">
        {dragState && !dragState.pointerStartInfo ? (
          <div
            className="CSVImporter_ColumnDragSourceArea__pageIndicator"
            role="status"
          >
            {translation.assigningColumns} {dragState.column.code}
          </div>
        ) : (
          // show page number if needed (and treat as status role if it has changed)
          // @todo changing role to status does not seem to work
          pageCount > 1 && (
            <div
              className="CSVImporter_ColumnDragSourceArea__pageIndicator"
              role={pageChanged ? 'status' : 'text'}
            >
              {translation.page} {page + 1} {translation.of} {pageCount}
            </div>
          )
        )}

        {pageContents}
      </div>
      <div className="CSVImporter_ColumnDragSourceArea__control">
        <IconButton
          label={translation.showNextColumns}
          type="forward"
          disabled={page === pageCount - 1}
          onClick={() => {
            setPage((prev) => Math.min(pageCount - 1, prev + 1));
          }}
        />
      </div>
    </section>
  );
};
