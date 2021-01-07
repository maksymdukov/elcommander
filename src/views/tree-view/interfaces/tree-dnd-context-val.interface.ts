import { TreeDNDState } from './tree-dnd-state.interface';

export interface TreeDndContextVal {
  state: TreeDNDState;
  setMouseCoords: (
    x: TreeDNDState['mouseX'],
    y: TreeDNDState['mouseY']
  ) => void;
  setIsDroppable: (isDroppable: boolean) => void;
}
