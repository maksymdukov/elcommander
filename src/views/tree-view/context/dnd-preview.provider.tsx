import React from 'react';
import { DndPreviewContext } from './dnd-preview.context';
import { DNDPreviewState } from '../interfaces/tree-dnd-state.interface';

interface DndPreviewProviderProps {
  previewState: DNDPreviewState;
}

const DndPreviewProvider: React.FC<DndPreviewProviderProps> = ({
  children,
  previewState,
}) => {
  return (
    <DndPreviewContext.Provider value={previewState}>
      {children}
    </DndPreviewContext.Provider>
  );
};

export default DndPreviewProvider;
