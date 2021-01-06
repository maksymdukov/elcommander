import React from 'react';
import {
  moveCursorAction,
  toggleDirectoryAction,
  TreeActions,
  TreeState,
} from '../tree-view-state';
import {
  Children,
  IFSBackend,
} from '../../../backends/interfaces/fs-backend.interface';
import { DirectoryNode } from '../../../classes/dir-node';
import { makeVisible } from '../tree-view.utils';
import { ICursor } from '../../../interfaces/cursor.interface';
import { TreeNode } from '../../../classes/tree-node';
import { useContainerRef } from './use-container-ref.hook';

interface UseTreeActionsProps {
  treeState: TreeState;
  dispatch: React.Dispatch<TreeActions>;
  fsManager: IFSBackend;
}

export const useTreeActions = ({
  dispatch,
  fsManager,
}: UseTreeActionsProps) => {
  const containerRef = useContainerRef();
  const setFirstNodeAsCursor = (node: TreeNode) => {
    dispatch(moveCursorAction(node));
  };

  const throwIfContainerNotSet = (): void | never => {
    if (!containerRef?.current) {
      throw new Error('Container ref must be set');
    }
  };

  const toggleDirectory = async (directoryNode: DirectoryNode) => {
    let children: Children = [];
    if (!directoryNode.isOpened) {
      children = await fsManager.readDir(
        directoryNode.getFullPathBy('name'),
        directoryNode
      );
    }
    dispatch(toggleDirectoryAction(directoryNode, children));
  };

  const moveCursor = (
    cursor: ICursor | null,
    down = true,
    container: HTMLElement
  ) => {
    if (!cursor) {
      return;
    }
    const nextNode = cursor.node.getChildToSelect(down);
    if (nextNode) {
      makeVisible(nextNode, container);
      dispatch(moveCursorAction(nextNode));
    }
  };

  return {
    toggleDirectory,
    setFirstNodeAsCursor,
    moveCursor,
    throwIfContainerNotSet,
  };
};
