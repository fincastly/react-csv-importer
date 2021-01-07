import React, { useContext } from 'react';

import { TextButton } from './TextButton';

import './FormatErrorMessage.scss';
import { TranslationContext } from '../translation/TranslationContext';

export const FormatErrorMessage: React.FC<{
  onCancelClick: () => void;
  // eslint-disable-next-line react/display-name
}> = React.memo(({ onCancelClick, children }) => {
  const translation = useContext(TranslationContext);
  return (
    <div className="CSVImporter_FormatErrorMessage">
      <span>{children}</span>
      <TextButton onClick={onCancelClick}>{translation.goBack}</TextButton>
    </div>
  );
});
