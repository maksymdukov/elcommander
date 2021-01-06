import React from 'react';
import {
  markItemsSelectedFromTo,
  moveCursorAction,
  resetSelectedItemsAction,
  toggleItemSelectedAction,
  TreeActions,
  TreeState,
} from '../tree-view-state';
import { IFSBackend } from '../../../backends/interfaces/fs-backend.interface';
import { DirectoryNode } from '../../../classes/dir-node';
import { useTreeActions } from './use-tree-actions.hook';
import { useLassoSelection } from './use-lasso-selection.hook';

interface UseTreeMouseHandlersProps {
  treeState: TreeState;
  dispatch: React.Dispatch<TreeActions>;
  fsManager: IFSBackend;
}

export const useTreeMouseHandlers = ({
  dispatch,
  fsManager,
  treeState,
}: UseTreeMouseHandlersProps) => {
  const { toggleDirectory, throwIfContainerNotSet } = useTreeActions({
    dispatch,
    treeState,
    fsManager,
  });

  const { lassoStart } = useLassoSelection({
    dispatch,
    treeState,
    fsManager,
  });

  const handleShiftMouseClick = (e: React.MouseEvent) => {
    const { treeNode } = e;
    // no active cursor
    if (!treeState.cursor) {
      if (treeState.selected.length) {
        dispatch(resetSelectedItemsAction());
      }
      dispatch(moveCursorAction(treeNode));
      return;
    }
    // clicked on a cursor element
    if (treeState.cursor?.node === treeNode) {
      dispatch(toggleItemSelectedAction(treeState.cursor.node));
      return;
    }
    // find out direction of mouse click
    // find every child
    const cursorElement = treeState.cursor.node.element;
    if (cursorElement) {
      if (e.clientY > cursorElement.getBoundingClientRect().top) {
        // selecting down
        dispatch(
          markItemsSelectedFromTo(treeState.cursor.node, treeNode, true)
        );
      } else {
        // selecting up
        dispatch(
          markItemsSelectedFromTo(treeState.cursor.node, treeNode, false)
        );
      }
      dispatch(moveCursorAction(treeNode));
    }
  };

  const handleToggleDirectoryClick = async (e: React.MouseEvent) => {
    if (e.treeNode instanceof DirectoryNode) {
      const { treeNode: directoryNode } = e;
      await toggleDirectory(directoryNode);
    }
  };

  const handleItemCursorClick = (e: React.MouseEvent) => {
    const { treeNode } = e;
    if (treeState.selected.length) {
      dispatch(resetSelectedItemsAction());
    }
    dispatch(moveCursorAction(treeNode));
  };

  const handleMouseDownClick = (e: React.MouseEvent) => {
    throwIfContainerNotSet();
    // set initial value for scrollPosition state
    lassoStart(e);
  };

  const handleCtrlMouseClick = (e: React.MouseEvent) => {
    throwIfContainerNotSet();
    // toggle-select targetnode
    dispatch(toggleItemSelectedAction(e.treeNode));
  };

  return {
    handleShiftMouseClick,
    handleToggleDirectoryClick,
    handleItemCursorClick,
    handleMouseDownClick,
    handleCtrlMouseClick,
  };
};
