import { TreeNode } from '../../../interfaces/node.interface';

export interface ByIdsState {
  [k: string]: TreeNode;
}

export interface TreeState {
  byIds: ByIdsState;
  allIds: string[];
  cursor: null | number;
  selectedIds: Set<string>;
  lassoActive: boolean;
  lassoCoords: {
    start: number | null;
    current: number | null;
    mousePageY: number;
  };
  lassoScrolling: boolean;
  lassoStartCandidate: null;
}

export interface ViewsState {
  views: TreeState[];
}
