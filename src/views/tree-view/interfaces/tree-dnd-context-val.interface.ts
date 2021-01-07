import { DNDPreviewState, DNDState } from './tree-dnd-state.interface';
import { MutableRefObject } from 'react';

export interface CtxRef {
  isActive: boolean;
}

export interface TreeDndContextVal {
  state: DNDState;
  ctxRef: MutableRefObject<CtxRef>;
  setMouseCoords: (
    x: DNDPreviewState['mouseX'],
    y: DNDPreviewState['mouseY']
  ) => void;
  setIsDroppable: (isDroppable: boolean) => void;
}
