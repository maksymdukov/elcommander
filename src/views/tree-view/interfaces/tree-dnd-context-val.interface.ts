import { MutableRefObject } from 'react';
import { TreeNode } from 'interfaces/node.interface';
import { DNDPreviewState, DNDState } from './tree-dnd-state.interface';

export interface CtxRef {
  isActive: boolean;
  startViewIndex: number | null;
  startNode: TreeNode | null;
}

export interface TreeDndContextVal {
  state: DNDState;
  ctxRef: MutableRefObject<CtxRef>;
  setMouseCoords: (
    x: DNDPreviewState['mouseX'],
    y: DNDPreviewState['mouseY']
  ) => void;
  setIsDroppable: (isDroppable: boolean) => void;
  setContainerElement: (container: null | HTMLDivElement) => void;
}
