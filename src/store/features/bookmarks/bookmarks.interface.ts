import { TreeNode } from 'interfaces/node.interface';

export interface IBookmark {
  viewName: string;
  classId: string;
  configName: string;
  startNode: TreeNode;
}

export type BookmarksState = IBookmark[];
