import { createContext } from 'react';
import { noop } from '../../../utils/noop';
import { TreeNode } from '../../../interfaces/node.interface';

export type OnDragNDrop = (
  index: number,
  node: TreeNode
) => React.DragEventHandler;

export interface TreeDndHandlersVal {
  onMouseDown: React.MouseEventHandler;
  onMouseUp: React.MouseEventHandler;
  onMouseEnter: React.MouseEventHandler;
  onMouseLeave: React.MouseEventHandler;
  onDragEnter: OnDragNDrop;
  onDragLeave: OnDragNDrop;
  onDragOver: OnDragNDrop;
  onDrop: OnDragNDrop;
}

export const DroppableContext = createContext<TreeDndHandlersVal>({
  onMouseDown: noop,
  onMouseEnter: noop,
  onMouseLeave: noop,
  onMouseUp: noop,
  onDragEnter: () => noop,
  onDragLeave: () => noop,
  onDragOver: () => noop,
  onDrop: () => noop,
});
