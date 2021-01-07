export interface Translation {
  goBack?: string;
  next?: string;
  importError?: string;
  rawFileContent?: string;
  previewImport?: string;
  dataHasHeaders?: string;
  loadingPreview?: string;
  checkDataFormatting?: string;
  goToPreviousStep: string;
  import?: string;
  uploadMore?: string;
  finish?: string;
  couldNotImport?: string;
  complete?: string;
  importing?: string;
  processedRows?: string;
  dropCsvFilesHere?: string;
  dropCsvFilesHereOrClick?: string;
  selectColumns?: string;
  assignAllRequiredFields: string;
  dragColumnHere?: string;
  assignColumn?: string;
  clearColumnAssignment: string;
  unselectColumn: string;
  selectColumnForAssignment: string;
  showPreviousColumns: string;
  assigningColumns?: string;
  page?: string;
  of?: string;
  showNextColumns: string;
  unassignedFields?: string;
  column?: string;
}

export const DEFAULT_TRANSLATION: Translation = {
  next: 'Next',
  goBack: 'Go Back',
  importError: 'Import error',
  rawFileContent: 'Raw File Contents',
  previewImport: 'Preview Import',
  dataHasHeaders: 'Data has headers',
  loadingPreview: 'Loading preview',
  checkDataFormatting: 'please check data formatting',
  goToPreviousStep: 'Go to previous step',
  import: 'Import',
  uploadMore: 'Upload more',
  finish: 'Finish',
  couldNotImport: 'Could not import',
  complete: 'Complete',
  importing: 'Importing',
  processedRows: 'Processed rows',
  dropCsvFilesHere: 'Drop CSV file here',
  dropCsvFilesHereOrClick:
    'Drag-and-drop CSV file here, or click to select in folder',
  selectColumns: 'Select Columns',
  assignAllRequiredFields: 'Please assign all required fields',
  dragColumnHere: 'Drag column here',
  assignColumn: 'Assign column',
  clearColumnAssignment: 'Clear column assignment',
  unselectColumn: 'Unselect column',
  selectColumnForAssignment: 'Select column for assignment',
  showPreviousColumns: 'Show previous columns',
  assigningColumns: 'Assigning column',
  page: 'Page',
  of: 'of',
  showNextColumns: 'Show next columns',
  unassignedFields: 'Unassigned field',
  column: 'Column'
};
