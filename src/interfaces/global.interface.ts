import { TreeNode } from 'elcommander-plugin-sdk';
import { TreeEventType } from '../enums/tree-event-type.enum';

declare global {
  namespace React {
    interface MouseEvent {
      treeEventType: TreeEventType;
      treeIndex: number;
      treeNode: TreeNode;
    }
  }
}

declare global {
  interface HTMLElement {
    $$treeNode?: number;
  }
}
