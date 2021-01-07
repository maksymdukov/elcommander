import React from 'react';
import { TreeEventType } from '../../../enums/tree-event-type.enum';
import { TreeActions, TreeState } from '../tree-view-state';
import { IFSBackend } from '../../../backends/interfaces/fs-backend.interface';
import { useTreeKeyHandlers } from './use-tree-key-handlers.hook';
import { useTreeMouseHandlers } from './use-tree-mouse-handlers';
import { useContainerRef } from './use-container-ref.hook';

interface UseTreeHandlersProps {
  treeState: TreeState;
  dispatch: React.Dispatch<TreeActions>;
  fsManager: IFSBackend;
}

export const useTreeHandlersHook = ({
  treeState,
  dispatch,
  fsManager,
}: UseTreeHandlersProps) => {
  const containerRef = useContainerRef();
  const {
    handleArrowDown,
    handleArrowUp,
    handleArrowRight,
    handleArrowLeft,
    handleSpace,
    handleShiftArrowDown,
    handleShiftArrowUp,
  } = useTreeKeyHandlers({
    treeState,
    dispatch,
    fsManager,
  });

  const {
    handleShiftMouseClick,
    handleToggleDirectoryClick,
    handleItemCursorClick,
    handleMouseDownClick,
    handleCtrlMouseClick,
    handleItemCursorMouseDown,
  } = useTreeMouseHandlers({
    dispatch,
    fsManager,
    treeState,
  });

  const onClick = async (e: React.MouseEvent) => {
    // Ctrl + mouse click
    if (e.treeEventType === TreeEventType.ItemCtrlSelect) {
      return handleCtrlMouseClick(e);
    }
    // Shift + MouseClick
    // mass select
    if (
      e.treeEventType === TreeEventType.ItemCursorSelect &&
      e.shiftKey &&
      e.treeNode
    ) {
      return handleShiftMouseClick(e);
    }
    // Directory toggle click
    if (e.treeEventType === TreeEventType.DirectoryToggle) {
      return handleToggleDirectoryClick(e);
    }
    // Cursor select
    if (e.treeEventType === TreeEventType.ItemCursorSelect) {
      return handleItemCursorClick(e);
    }
  };

  const onKeyDown = async (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Shift + Down
    if (e.key === 'ArrowDown' && e.shiftKey) {
      e.preventDefault();
      return handleShiftArrowDown(e);
    }

    // Shift + Up
    if (e.key === 'ArrowUp' && e.shiftKey) {
      e.preventDefault();
      return handleShiftArrowUp(e);
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      return handleArrowDown(e);
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      return handleArrowUp(e);
    }
    // right
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      return handleArrowRight();
    }
    // left
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      return handleArrowLeft();
    }

    // Space
    if (e.key === ' ') {
      e.preventDefault();
      return handleSpace(e);
    }
  };

  const onMouseDown = (e: React.MouseEvent) => {
    if (!e.treeEventType) {
      return;
    }
    if (
      e.treeEventType === TreeEventType.LassoSelectStart &&
      !treeState.lassoActive
    ) {
      return handleMouseDownClick(e);
    }
  };

  const getContainerProps = () => ({
    onClick,
    onKeyDown,
    ref: containerRef,
    onMouseDown,
  });

  return {
    getContainerProps,
    handleItemCursorMouseDown,
  };
};
