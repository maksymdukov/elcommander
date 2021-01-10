import React, { useRef } from 'react';
import { DroppableContext, TreeDndHandlersVal } from './droppable.context';

const Droppable: React.FC<TreeDndHandlersVal> = ({
  onMouseLeave,
  onMouseEnter,
  onMouseDown,
  onMouseUp,
  onDragLeave,
  onDragEnter,
  onDrop,
  onDragOver,
  children,
}) => {
  const valueRef = useRef<TreeDndHandlersVal>({
    onMouseLeave,
    onMouseEnter,
    onMouseDown,
    onMouseUp,
    onDrop,
    onDragLeave,
    onDragEnter,
    onDragOver,
  });
  return (
    <DroppableContext.Provider value={valueRef.current}>
      {children}
    </DroppableContext.Provider>
  );
};

export default Droppable;
