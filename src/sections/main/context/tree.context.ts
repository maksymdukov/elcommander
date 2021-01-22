import { createContext, MutableRefObject } from 'react';

export interface TreeContextVal {
  treeContainerRef: MutableRefObject<HTMLElement | null>;
}

export const TreeContext = createContext<TreeContextVal>({
  treeContainerRef: { current: null },
});
