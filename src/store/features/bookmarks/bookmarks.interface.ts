import { TreeNode } from 'elcommander-plugin-sdk';

export interface IBookmark {
  viewName: string;
  classId: string;
  configName: string;
  startNode: TreeNode;
}

export type BookmarksState = IBookmark[];
