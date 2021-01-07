import { createContext } from 'react';
import { noop } from '../../../utils/noop';

export interface TreeDndHandlersVal {
  onMouseDown: React.MouseEventHandler;
  onMouseUp: React.MouseEventHandler;
  onMouseEnter: React.MouseEventHandler;
  onMouseLeave: React.MouseEventHandler;
}

export const DroppableContext = createContext<TreeDndHandlersVal>({
  onMouseDown: noop,
  onMouseEnter: noop,
  onMouseLeave: noop,
  onMouseUp: noop,
});
