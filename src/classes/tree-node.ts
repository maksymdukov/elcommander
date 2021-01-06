interface NodeCtrProps {
  idx: number | undefined;
  parent?: TreeNode;
  name: string;
}

export abstract class TreeNode {
  element: HTMLDivElement | null = null;

  protected children: TreeNode[] = [];

  #pathCache: number[] = [];

  #isOpened = false;

  isCursor = false;

  hasChanged = true;

  isSelected = false;

  name: string;

  idx: number | undefined;

  parent?: TreeNode;

  protected constructor({ idx, name, parent }: NodeCtrProps) {
    this.idx = idx;
    this.name = name;
    this.parent = parent;
  }

  get isOpened() {
    return this.#isOpened;
  }

  set isOpened(val) {
    this.#isOpened = val;
  }

  markChanged() {
    this.hasChanged = true;
  }

  markUnchanged() {
    this.hasChanged = false;
  }

  setNativeElement(element: HTMLDivElement | null) {
    this.element = element;
  }

  toggleSelected() {
    this.isSelected = !this.isSelected;
    this.markChanged();
  }

  markSelected() {
    this.isSelected = true;
    this.markChanged();
  }

  makeCursor() {
    this.isCursor = true;
    this.markChanged();
  }

  getParent() {
    return this.parent;
  }

  toggleCursor() {
    this.isCursor = !this.isCursor;
    this.markChanged();
  }

  getPath(): number[] {
    if (this.#pathCache.length) {
      return this.#pathCache;
    }
    const parent = this.getParent();
    let returnedPath: number[] = [];
    if (parent) {
      returnedPath = parent.getPath();
    }
    if (this.idx !== undefined) {
      this.#pathCache = [...returnedPath, this.idx];
    } else {
      this.#pathCache = [...returnedPath];
    }
    return this.#pathCache;
  }

  isMyParent(node: TreeNode) {
    let parent = this.getParent();
    while (parent !== undefined) {
      if (parent === node) {
        return true;
      }
      parent = parent.getParent();
    }
    return false;
  }

  getNextChild(after: number, fwd = true): null | TreeNode {
    const condition = fwd ? after < this.children.length - 1 : after > 0;
    if (condition) {
      // return next child
      return this.children[fwd ? after + 1 : after - 1];
    }
    const parent = this.getParent();
    if (!parent || this.idx === undefined) {
      return null;
    }
    return parent.getNextChild(this.idx, fwd);
  }

  findDeepestLastOpenItem(): TreeNode {
    // empty dir or file
    if (!this.children.length) {
      return this;
    }
    const child = this.children[this.children.length - 1];
    if (child.isOpened) {
      return child.findDeepestLastOpenItem();
    }
    return this.children[this.children.length - 1];
  }

  getChildToSelect(fwd = true): TreeNode | null {
    // Cursor on the directory and directory has children
    // return first child
    if (fwd) {
      if (this.children.length) {
        return this.children[0];
      }
    }

    const parent = this.getParent();
    if (!parent || this.idx === undefined) {
      return null;
    }

    // this is the first node of its parent
    // select parent
    if (!fwd && this.idx === 0) {
      return parent;
    }

    const prevChild = parent.getNextChild(this.idx, fwd);
    // going up
    if (!fwd) {
      // prev child in parent is an opened dir
      // let's find last deepest opened item
      if (prevChild && prevChild.isOpened) {
        return prevChild.findDeepestLastOpenItem();
      }
    }

    // just select prev
    return prevChild;
  }

  getAdjacentOpenedFlatListTo(node: TreeNode, fwd: boolean) {
    const result: { node: TreeNode }[] = [];
    let target: TreeNode | null = this;
    while (target !== node && target !== null) {
      result.push({ node: target });
      target = target.getChildToSelect(fwd);
    }
    result.push({ node });
    return result;
  }
}
