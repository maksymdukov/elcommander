import { createContext } from 'react';
import { DNDPreviewState } from '../interfaces/tree-dnd-state.interface';

export const DndPreviewContext = createContext<DNDPreviewState>({
  mouseX: null,
  mouseY: null,
});
