import { TreeNode } from './tree-node';

export class DirectoryNode extends TreeNode {
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
  }

  setChildren(children: TreeNode[]) {
    this.children = children;
    this.markChanged();
  }

  updateNthChild(idx: number, updatedChild: TreeNode) {
    this.children[idx] = updatedChild;
    this.markChanged();
    return this.children;
  }

  getNthChild(idx: number) {
    if (this.children.length) {
      return this.children[idx];
    }
    throw new Error('No children yet');
  }

  getChildren() {
    return this.children;
  }

  toggleOpen() {
    this.isOpened = !this.isOpened;
    this.markChanged();
  }

  getFullPathBy<T extends MapClassKeys<TreeNode>>(key: T): TreeNode[T][] {
    const paths = [(this as TreeNode)[key]];
    let parent = this.getParent();
    while (parent !== undefined) {
      paths.push(parent[key]);
      parent = parent.getParent();
    }
    return paths.reverse();
  }
}

// TODO make types better
type MapClassKeys<T> = keyof {
  // eslint-disable-next-line @typescript-eslint/ban-types
  [P in keyof T]: T[P] extends Function ? never : T[P];
};
