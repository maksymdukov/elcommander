import React, { useRef } from 'react';
import {
  TreeDndHandlersContext,
  TreeDndHandlersVal,
} from './tree-dnd-handlers.context';

const TreeDndHandlersProvider: React.FC<TreeDndHandlersVal> = ({
  onMouseLeave,
  onMouseEnter,
  onMouseDown,
  onMouseUp,
  children,
}) => {
  const valueRef = useRef<TreeDndHandlersVal>({
    onMouseLeave,
    onMouseEnter,
    onMouseDown,
    onMouseUp,
  });
  return (
    <TreeDndHandlersContext.Provider value={valueRef.current}>
      {children}
    </TreeDndHandlersContext.Provider>
  );
};

export default TreeDndHandlersProvider;
