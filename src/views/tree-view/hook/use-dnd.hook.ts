import React, { useCallback, useRef } from 'react';
import { useDndContext } from './use-dnd-context.hook';
import { TreeDndHandlersVal } from '../context/droppable.context';
import { TreeNode } from '../../../interfaces/node.interface';
import { TreeEventType } from '../../../enums/tree-event-type.enum';
import { useCurrentValue } from '../../../utils/use-current-value.hook';

interface UseDndHookProps {
  viewIndex: number;
  onNodeDragEnter: (nodeIndex: number, node: TreeNode) => void;
  onNodeExternalDragEnter: (nodeIndex: number, node: TreeNode) => void;
  onNodeDragLeave: (nodeIndex: number, node: TreeNode) => void;
  onNodeExternalDragLeave: (nodeIndex: number, node: TreeNode) => void;
  onNodeDrop: (nodeIndex: number, node: TreeNode) => void;
  onInitialMouseDown?: (nodeIndex: number, node: TreeNode) => void;
  droppableFilter?: ({
    startNode,
    currentNode,
    startNodeIndex,
    currentNodeIndex,
  }: {
    startNode: TreeNode | null;
    currentNode: TreeNode;
    startNodeIndex: number | null;
    currentNodeIndex: number;
  }) => boolean;
  onContainerEnter: () => void;
  onContainerLeave: () => void;
  onContainerDrop: () => void;
  onContainerExternalDrop: () => void;
  onNodeExternalDrop: (index: number, node: TreeNode) => void;
  onDndFinish: () => void;
}

const defaultFilter: UseDndHookProps['droppableFilter'] = ({
  currentNodeIndex,
  startNodeIndex,
}) => startNodeIndex !== currentNodeIndex;

export const useDnd = ({
  viewIndex,
  onNodeDragEnter,
  onNodeDragLeave,
  onNodeDrop,
  onInitialMouseDown,
  droppableFilter = defaultFilter,
  onContainerEnter,
  onContainerLeave,
  onDndFinish,
  onContainerDrop,
  onContainerExternalDrop,
  onNodeExternalDrop,
  onNodeExternalDragEnter,
  onNodeExternalDragLeave,
}: UseDndHookProps) => {
  const currentViewIndex = useCurrentValue(viewIndex);
  const { setMouseCoords, setIsDroppable, ctxRef } = useDndContext();
  const startNodeRef = useRef<TreeNode | null>(null);
  const startNodeIndexRef = useRef<number | null>(null);

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
      onDndFinish();
      window.removeEventListener('mousemove', onGlobalMouseMove);
      window.removeEventListener('mouseup', onGlobalMouseUp);
    },
    [setMouseCoords, onGlobalMouseMove, startNodeRef, ctxRef, onDndFinish]
  );

  const onLabelMouseDown = (e: React.MouseEvent) => {
    if (!e.treeEventType) {
      return;
    }
    const { treeIndex, treeNode } = e;
    if (onInitialMouseDown) {
      onInitialMouseDown(treeIndex, treeNode);
    }
    // e.preventDefault();
    ctxRef.current.startNode = treeNode;
    ctxRef.current.startViewIndex = currentViewIndex.current;
    startNodeRef.current = treeNode;
    startNodeIndexRef.current = treeIndex;
    setIsDroppable(false);
    window.addEventListener('mousemove', onGlobalMouseMove);
    window.addEventListener('mouseup', onGlobalMouseUp);
  };

  const onLabelMouseUp = (e: React.MouseEvent) => {
    if (!ctxRef.current.isActive) {
      return;
    }
    e.treeEventType = TreeEventType.DNDNodeDrop;
    ctxRef.current.startNode = null;
    ctxRef.current.startViewIndex = null;
    const { treeIndex, treeNode } = e;
    e.preventDefault();
    if (
      droppableFilter({
        startNode: startNodeRef.current!,
        startNodeIndex: startNodeIndexRef.current!,
        currentNode: treeNode,
        currentNodeIndex: treeIndex,
      })
    ) {
      onNodeDrop(treeIndex, treeNode);
    }
  };

  const onLabelMouseEnter = (e: React.MouseEvent) => {
    if (!ctxRef.current.isActive) {
      return;
    }
    const { treeIndex, treeNode } = e;
    if (
      !droppableFilter({
        startNode: startNodeRef.current!,
        startNodeIndex: startNodeIndexRef.current!,
        currentNode: treeNode,
        currentNodeIndex: treeIndex,
      })
    ) {
      setIsDroppable(false);
    } else {
      setIsDroppable(true);
      onNodeDragEnter(treeIndex, treeNode);
    }
  };

  const onLabelMouseLeave = (e: React.MouseEvent) => {
    if (!ctxRef.current.isActive) {
      return;
    }
    const { treeIndex, treeNode } = e;
    if (
      droppableFilter({
        currentNodeIndex: treeIndex,
        currentNode: treeNode,
        startNodeIndex: startNodeIndexRef.current!,
        startNode: startNodeRef.current!,
      })
    ) {
      onNodeDragLeave(treeIndex, treeNode);
    }
    setIsDroppable(true);
  };

  const onContainerMouseEnter = () => {
    if (!ctxRef.current.isActive) {
      return;
    }
    setIsDroppable(true);
    onContainerEnter();
  };
  const onContainerMouseLeave = () => {
    if (!ctxRef.current.isActive) {
      return;
    }
    setIsDroppable(false);
    onContainerLeave();
  };

  const onContainerMouseUp = (e: React.MouseEvent) => {
    if (!ctxRef.current.isActive) {
      return;
    }
    if (e.treeEventType) {
      return;
    }
    onContainerDrop();
  };

  const onContainerDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
  };

  const onContainerDragDrop = (e: React.DragEvent) => {
    e.preventDefault();
    onContainerExternalDrop();
  };

  const onLabelDragEnter = (index: number, node: TreeNode) => (
    e: React.DragEvent
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (
      droppableFilter({
        startNode: null,
        currentNode: node,
        startNodeIndex: null,
        currentNodeIndex: index,
      })
    ) {
      e.dataTransfer.dropEffect = 'copy';
      onNodeExternalDragEnter(index, node);
    } else {
      e.dataTransfer.dropEffect = 'none';
    }
  };
  const onLabelDragLeave = (index: number, node: TreeNode) => (
    e: React.DragEvent
  ) => {
    e.stopPropagation();
    if (
      droppableFilter({
        startNode: null,
        currentNode: node,
        startNodeIndex: null,
        currentNodeIndex: index,
      })
    ) {
      onNodeExternalDragLeave(index, node);
    }
  };
  const onLabelDragDrop = (index: number, node: TreeNode) => (
    e: React.DragEvent
  ) => {
    e.preventDefault();
    e.stopPropagation();
    onNodeExternalDrop(index, node);
  };

  const onLabelDragOver = (index: number, node: TreeNode) => (
    e: React.DragEvent
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (
      droppableFilter({
        startNode: null,
        currentNode: node,
        startNodeIndex: null,
        currentNodeIndex: index,
      })
    ) {
      e.dataTransfer.dropEffect = 'copy';
    } else {
      e.dataTransfer.dropEffect = 'none';
    }
  };

  const getDndHandlers = () => ({
    onDragOver: onContainerDragOver,
    onMouseEnter: onContainerMouseEnter,
    onMouseLeave: onContainerMouseLeave,
    onMouseUp: onContainerMouseUp,
    onDrop: onContainerDragDrop,
  });

  const getNodeHandlers = (): TreeDndHandlersVal => ({
    onMouseDown: onLabelMouseDown,
    onMouseUp: onLabelMouseUp,
    onMouseEnter: onLabelMouseEnter,
    onMouseLeave: onLabelMouseLeave,
    onDragEnter: onLabelDragEnter,
    onDragLeave: onLabelDragLeave,
    onDragOver: onLabelDragOver,
    onDrop: onLabelDragDrop,
  });

  return {
    getDndHandlers,
    getNodeHandlers,
  };
};
