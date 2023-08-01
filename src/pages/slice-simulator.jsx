/* eslint-disable react/no-unstable-nested-components */
import { SliceSimulator } from '@prismicio/slice-simulator-react';
import { SliceZone } from '@prismicio/react';

import { components } from '../../slices';

function SliceSimulatorPage() {
  return (
    <SliceSimulator
      sliceZone={({ slices }) => (
        <SliceZone slices={slices} components={components} />
      )}
      state={{}}
    />
  );
}

export default SliceSimulatorPage;
