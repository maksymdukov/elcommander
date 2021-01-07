import React, { useCallback, useRef } from 'react';
import { useDndContext } from './use-dnd-context.hook';
import { TreeDndHandlersVal } from '../context/tree-dnd-handlers.context';
import { TreeNode } from '../../../classes/tree-node';

interface UseDndHookProps {
  onNodeDragEnter: (node: TreeNode) => void;
  onNodeDragLeave: (node: TreeNode) => void;
  onNodeDrop: (node: TreeNode) => void;
  droppableFilter?: (startNode: TreeNode, currentNode: TreeNode) => boolean;
}

const defaultFilter: UseDndHookProps['droppableFilter'] = (start, curr) =>
  start !== curr;

export const useDnd = ({
  onNodeDragEnter,
  onNodeDragLeave,
  onNodeDrop,
  droppableFilter = defaultFilter,
}: UseDndHookProps) => {
  const { setMouseCoords, setIsDroppable } = useDndContext();
  const startNodeRef = useRef<TreeNode | null>(null);
  const isDndActiveRef = useRef(false);

  const onGlobalMouseMove = useCallback(
    (e: MouseEvent) => {
      setMouseCoords(e.pageX, e.pageY);
      isDndActiveRef.current = true;
    },
    [setMouseCoords]
  );

  const onGlobalMouseUp = useCallback(
    (_: MouseEvent) => {
      setMouseCoords(null, null);
      startNodeRef.current = null;
      isDndActiveRef.current = false;
      window.removeEventListener('mousemove', onGlobalMouseMove);
      window.removeEventListener('mouseup', onGlobalMouseUp);
    },
    [setMouseCoords, onGlobalMouseMove, startNodeRef]
  );

  const onLabelMouseDown = (e: React.MouseEvent) => {
    if (!e.treeEventType) {
      return;
    }
    // TODO
    // introduce onInitialMouseDown
    // only do dispatch(moveCursorAction(treeNode));
    e.preventDefault();
    startNodeRef.current = e.treeNode;
    console.log('onLabelMouseDown');
    window.addEventListener('mousemove', onGlobalMouseMove);
    window.addEventListener('mouseup', onGlobalMouseUp);
  };

  const onLabelMouseUp = (e: React.MouseEvent) => {
    if (!isDndActiveRef.current) {
      return;
    }
    if (!e.treeEventType) {
      return;
    }
    e.preventDefault();
    onNodeDrop(e.treeNode);
  };

  const onLabelMouseEnter = (e: React.MouseEvent) => {
    if (!isDndActiveRef.current || !startNodeRef.current) {
      return;
    }
    if (!e.treeEventType) {
      return;
    }
    if (!droppableFilter(startNodeRef.current, e.treeNode)) {
      setIsDroppable(false);
    } else {
      setIsDroppable(true);
      onNodeDragEnter(e.treeNode);
    }
  };

  const onLabelMouseLeave = (e: React.MouseEvent) => {
    if (!isDndActiveRef.current || !startNodeRef.current) {
      return;
    }
    if (!e.treeEventType) {
      return;
    }
    // dont invoke cb if we are leaving startNode
    if (!droppableFilter(startNodeRef.current, e.treeNode)) {
      return;
    }
    setIsDroppable(false);
    onNodeDragLeave(e.treeNode);
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
