import { createContext } from 'react';
import { TreeDndContextVal } from '../interfaces/tree-dnd-context-val.interface';

export const TreeDNDContext = createContext<TreeDndContextVal>({
  state: {
    mouseX: null,
    mouseY: null,
    isDroppable: false,
  },
  setMouseCoords: () => {},
  setIsDroppable: () => {},
});
