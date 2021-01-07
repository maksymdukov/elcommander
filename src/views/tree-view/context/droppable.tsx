import React, { useRef } from 'react';
import { DroppableContext, TreeDndHandlersVal } from './droppable.context';

const Droppable: React.FC<TreeDndHandlersVal> = ({
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
    <DroppableContext.Provider value={valueRef.current}>
      {children}
    </DroppableContext.Provider>
  );
};

export default Droppable;
