import React from 'react';
import { makeVisible } from '../tree-view.utils';
import {
  toggleItemSelectedAction,
  moveCursorAction,
  toggleDirectoryAction,
  TreeActions,
  TreeState,
} from '../tree-view-state';
import { useTreeActions } from './use-tree-actions.hook';
import { DirectoryNode } from '../../../classes/dir-node';
import { IFSBackend } from '../../../backends/interfaces/fs-backend.interface';
import { useContainerRef } from './use-container-ref.hook';

interface UseKeyHandlersProps {
  treeState: TreeState;
  dispatch: React.Dispatch<TreeActions>;
  fsManager: IFSBackend;
}

export const useTreeKeyHandlers = ({
  treeState,
  dispatch,
  fsManager,
}: UseKeyHandlersProps) => {
  const { cursor } = treeState;
  const containerRef = useContainerRef();
  const {
    setFirstNodeAsCursor,
    moveCursor,
    throwIfContainerNotSet,
  } = useTreeActions({
    dispatch,
    treeState,
    fsManager,
  });

  const handleArrowDown = (_: React.KeyboardEvent<HTMLDivElement>) => {
    throwIfContainerNotSet();
    if (!cursor) {
      return setFirstNodeAsCursor(treeState.tree);
    }
    const nextNode = cursor.node.getChildToSelect(true);
    if (nextNode) {
      makeVisible(nextNode, containerRef!.current!);
      dispatch(moveCursorAction(nextNode));
    }
  };

  const handleArrowUp = (_: React.KeyboardEvent<HTMLDivElement>) => {
    throwIfContainerNotSet();
    if (!cursor) {
      return setFirstNodeAsCursor(treeState.tree);
    }
    const nextNode = cursor.node.getChildToSelect(false);
    if (nextNode) {
      makeVisible(nextNode, containerRef!.current!);
      dispatch(moveCursorAction(nextNode));
    }
  };

  const handleArrowRight = async () => {
    if (!cursor) {
      return setFirstNodeAsCursor(treeState.tree);
    }
    const lastCursor = cursor.node;
    if (lastCursor instanceof DirectoryNode && !lastCursor.isOpened) {
      const children = await fsManager.readDir(
        lastCursor.getFullPathBy('name'),
        lastCursor
      );
      dispatch(toggleDirectoryAction(lastCursor, children));
    }
  };

  const handleArrowLeft = () => {
    if (!cursor) {
      return setFirstNodeAsCursor(treeState.tree);
    }
    const lastCursor = cursor.node;
    if (lastCursor instanceof DirectoryNode && lastCursor.isOpened) {
      dispatch(toggleDirectoryAction(lastCursor, []));
    }
  };

  const handleSpace = (_: React.KeyboardEvent<HTMLDivElement>) => {
    throwIfContainerNotSet();
    if (!cursor) {
      return;
    }
    dispatch(toggleItemSelectedAction(cursor.node));
    moveCursor(cursor, true, containerRef!.current!);
  };

  const handleShiftArrowDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    return handleSpace(e);
  };

  const handleShiftArrowUp = (_: React.KeyboardEvent<HTMLDivElement>) => {
    throwIfContainerNotSet();
    if (!cursor) {
      return;
    }
    dispatch(toggleItemSelectedAction(cursor.node));
    moveCursor(cursor, false, containerRef!.current!);
  };

  return {
    handleArrowDown,
    handleArrowUp,
    handleArrowRight,
    handleArrowLeft,
    handleSpace,
    handleShiftArrowDown,
    handleShiftArrowUp,
  };
};
