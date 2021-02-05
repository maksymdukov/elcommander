import { TreeNode } from 'elcommander-plugin-sdk';

export interface ByIdState {
  [k: string]: TreeNode;
}

export interface TreeState {
  classId: string;
  viewId: string;
  viewName: string;
  width: number;
  configName: string;
  byId: ByIdState;
  allIds: string[];
  cursor: null | number;
  enterStack: TreeNode[];
  selectedIds: Set<string>;
  startNode: TreeNode;
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
