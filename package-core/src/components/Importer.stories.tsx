import React from 'react';
import { Story, Meta } from '@storybook/react';

import { Importer, ImporterProps, ImporterField } from './Importer';

export default {
  title: 'Importer',
  component: Importer,
  parameters: { actions: { argTypesRegex: '^on.*' } }
} as Meta;

type SampleImporterProps = ImporterProps<{ fieldA: string }>;

export const Main: Story<SampleImporterProps> = (args: SampleImporterProps) => {
  return (
    <Importer
      {...args}
      onStart={(info, assignments) => console.log(assignments)}
      onCancel={() => console.log('cancel')}
      onUpload={() => console.log('upload')}
    >
      <ImporterField name="fieldA" label="Field A" />
      <ImporterField name="fieldB" label="Field B" optional />
    </Importer>
  );
};
