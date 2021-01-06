import { TreeNode } from '../classes/tree-node';
import { TreeEventType } from '../enums/tree-event-type.enum';

declare global {
  namespace React {
    interface MouseEvent {
      treeEventType: TreeEventType;
      treeNode: TreeNode;
    }
  }
}

declare global {
  interface HTMLElement {
    $$treeNode?: TreeNode | null;
  }
}
