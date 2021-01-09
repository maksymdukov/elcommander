import { TreeEventType } from '../enums/tree-event-type.enum';

declare global {
  namespace React {
    interface MouseEvent {
      treeEventType: TreeEventType;
      treeIndex: number;
    }
  }
}

declare global {
  interface HTMLElement {
    $$treeNode?: number;
  }
}
