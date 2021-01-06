import { TreeNode } from './tree-node';
import { DirectoryNode } from './dir-node';

export class FileNode extends TreeNode {
  constructor({
    name,
    parent,
    idx,
  }: {
    name: string;
    parent?: DirectoryNode;
    idx?: number;
  }) {
    super({ idx, parent, name });
    this.name = name;
  }

  set isOpened(_val: boolean) {
    throw new Error('Cant open a file');
  }

  getNextChild(_after: number, _fwd = true): TreeNode | null {
    throw new Error('Files cannot have children');
  }

  findDeepestLastOpenItem(): TreeNode {
    throw new Error('Files cannot have children');
  }
}
