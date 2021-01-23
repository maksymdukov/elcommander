import { TreeNode } from 'interfaces/node.interface';

export interface IBookmark {
  classId: string;
  configName: string;
  startNode: TreeNode;
}

export type BookmarksState = IBookmark[];
