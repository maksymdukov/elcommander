import { TreeNode } from '../../../interfaces/node.interface';

export interface ByIdsState {
  [k: string]: TreeNode;
}

export interface TreeState {
  byIds: ByIdsState;
  allIds: string[];
  cursor: null | number;
  selectedIds: Set<string>;
}

export interface ViewsState {
  views: TreeState[];
}
