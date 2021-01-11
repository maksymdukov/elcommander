import { TreeEventType } from '../enums/tree-event-type.enum';
import { TreeNode } from './node.interface';

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

  interface Error {
    path: string;
    syscall: string;
    code: string;
    errno: number;
  }
}
