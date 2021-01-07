import React, { useReducer } from 'react';
import NodeView from '../../components/tree/node-view';
import { IFSBackend } from '../../backends/interfaces/fs-backend.interface';
import { DirectoryNode } from '../../classes/dir-node';
import { treeStateReducer } from './tree-view-state';
import { useTreeHandlersHook } from './hooks/use-tree-handlers.hook';
import classes from './tree.view.scss';
import { useDnd } from './hooks/use-dnd.hook';
import TreeDndHandlersProvider from './context/tree-dnd-handlers.provider';
import { FileNode } from '../../classes/file-node';

interface TreeViewProps {
  initTree: DirectoryNode;
  fsManager: IFSBackend;
}

function TreeView({ fsManager, initTree }: TreeViewProps) {
  const [treeState, dispatch] = useReducer(treeStateReducer, {
    tree: initTree,
    cursor: null,
    selected: [],
    lassoActive: false,
    selectedHash: new Map(),
    lassoCoords: {
      current: null,
      start: null,
      mousePageY: 0,
    },
    lassoScrolling: false,
    lassoStartCandidate: null,
  });
  const { getContainerProps } = useTreeHandlersHook({
    treeState,
    dispatch,
    fsManager,
  });

  const { getDndHandlers, getNodeHandlers } = useDnd({
    onNodeDragEnter: (n) => console.log('enter', n.name),
    onNodeDragLeave: (n) => console.log('leave', n.name),
    onNodeDrop: (n) => console.log('drop', n.name),
    droppableFilter: (start, end) =>
      start !== end && !(end instanceof FileNode),
  });

  const {
    lassoCoords: { current, start },
  } = treeState;
  return (
    <div
      className={classes.TreeView}
      tabIndex={0}
      {...getContainerProps()}
      {...getDndHandlers()}
    >
      {treeState.lassoActive && current !== null && start !== null && (
        <div
          className={classes.Lasso}
          style={{
            top: Math.min(start, current),
            height: current > start ? current - start : start - current,
          }}
        />
      )}
      <TreeDndHandlersProvider {...getNodeHandlers()}>
        <NodeView node={treeState.tree} />
      </TreeDndHandlersProvider>
    </div>
  );
}

export default TreeView;
