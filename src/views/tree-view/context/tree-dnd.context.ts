import { createContext } from 'react';
import { TreeDndContextVal } from '../interfaces/tree-dnd-context-val.interface';

export const TreeDNDContext = createContext<TreeDndContextVal>({
  state: {
    isDroppable: false,
  },
  ctxRef: { current: { isActive: false } },
  setMouseCoords: () => {},
  setIsDroppable: () => {},
});
