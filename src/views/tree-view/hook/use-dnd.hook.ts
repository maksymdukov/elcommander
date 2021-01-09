import React, { useCallback, useRef } from 'react';
import { useDndContext } from './use-dnd-context.hook';
import { TreeDndHandlersVal } from '../context/droppable.context';

interface UseDndHookProps {
  onNodeDragEnter: (node: number) => void;
  onNodeDragLeave: (node: number) => void;
  onNodeDrop: (node: number) => void;
  onInitialMouseDown?: (node: number) => void;
  droppableFilter?: (startNode: number, currentNode: number) => boolean;
}

const defaultFilter: UseDndHookProps['droppableFilter'] = (start, curr) =>
  start !== curr;

export const useDnd = ({
  onNodeDragEnter,
  onNodeDragLeave,
  onNodeDrop,
  onInitialMouseDown,
  droppableFilter = defaultFilter,
}: UseDndHookProps) => {
  const { setMouseCoords, setIsDroppable, ctxRef } = useDndContext();
  const startNodeRef = useRef<number | null>(null);

  const onGlobalMouseMove = useCallback(
    (e: MouseEvent) => {
      setMouseCoords(e.pageX, e.pageY);
      ctxRef.current.isActive = true;
    },
    [setMouseCoords, ctxRef]
  );

  const onGlobalMouseUp = useCallback(
    (_: MouseEvent) => {
      setMouseCoords(null, null);
      startNodeRef.current = null;
      ctxRef.current.isActive = false;
      window.removeEventListener('mousemove', onGlobalMouseMove);
      window.removeEventListener('mouseup', onGlobalMouseUp);
    },
    [setMouseCoords, onGlobalMouseMove, startNodeRef, ctxRef]
  );

  const onLabelMouseDown = (e: React.MouseEvent) => {
    if (!e.treeEventType) {
      return;
    }
    if (onInitialMouseDown) {
      onInitialMouseDown(e.treeIndex);
    }
    e.preventDefault();
    startNodeRef.current = e.treeIndex;
    console.log('onLabelMouseDown');
    window.addEventListener('mousemove', onGlobalMouseMove);
    window.addEventListener('mouseup', onGlobalMouseUp);
  };

  const onLabelMouseUp = (e: React.MouseEvent) => {
    if (!ctxRef.current.isActive) {
      return;
    }
    e.preventDefault();
    onNodeDrop(e.treeIndex);
  };

  const onLabelMouseEnter = (e: React.MouseEvent) => {
    if (!ctxRef.current.isActive) {
      return;
    }
    if (!droppableFilter(startNodeRef.current!, e.treeIndex)) {
      setIsDroppable(false);
    } else {
      setIsDroppable(true);
      onNodeDragEnter(e.treeIndex);
    }
  };

  const onLabelMouseLeave = (e: React.MouseEvent) => {
    if (!ctxRef.current.isActive) {
      return;
    }
    if (!droppableFilter(startNodeRef.current!, e.treeIndex)) {
      return;
    }
    setIsDroppable(false);
    onNodeDragLeave(e.treeIndex);
  };

  const onDragOver = (e: React.DragEvent) => {
    if (!e.treeEventType) {
      return;
    }
    e.preventDefault();
  };

  const getDndHandlers = () => ({
    onDragOver,
  });

  const getNodeHandlers = (): TreeDndHandlersVal => ({
    onMouseDown: onLabelMouseDown,
    onMouseUp: onLabelMouseUp,
    onMouseEnter: onLabelMouseEnter,
    onMouseLeave: onLabelMouseLeave,
  });

  return {
    getDndHandlers,
    getNodeHandlers,
  };
};
