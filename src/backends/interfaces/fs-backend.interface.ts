import { DirectoryNode } from '../../classes/dir-node';
import { TreeNode } from '../../classes/tree-node';

export interface IFSBackend {
  readDir: (paths: string[], parent: DirectoryNode) => Promise<Children>;
}

export type Children = TreeNode[];
