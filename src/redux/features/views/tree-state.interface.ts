import { TreeNode } from '../../../interfaces/node.interface';

export interface ByPathState {
  [k: string]: TreeNode;
}

export interface TreeState {
  viewName: string;
  viewId: string;
  byPath: ByPathState;
  allPath: string[];
  cursor: null | number;
  enterStack: TreeNode[];
  selectedPaths: Set<string>;
  startPath: string;
  startPathLoading: boolean;
  startPathError: string | null;
}

export interface ViewsState {
  views: TreeState[];
}

export interface ViewIndexPayload {
  viewIndex: number;
}

export type ViewStatePayload<T> = T & ViewIndexPayload;
