import { TreeNode } from '../../../interfaces/node.interface';

export interface ByIdsState {
  [k: string]: TreeNode;
}

export interface TreeState {
  viewName: string;
  viewId: string;
  byIds: ByIdsState;
  allIds: string[];
  cursor: null | number;
  selectedIds: Set<string>;
  startPath: string;
}

export interface ViewsState {
  views: TreeState[];
}

export interface ViewIndexPayload {
  viewIndex: number;
}

export type ViewStatePayload<T> = T & ViewIndexPayload;
