import React, { useReducer } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import NodeView from '../../components/tree/node-view';
import { IFSBackend } from '../../backends/interfaces/fs-backend.interface';
import { DirectoryNode } from '../../classes/dir-node';
import { treeStateReducer } from './tree-view-state';
import { useTreeHandlersHook } from './hooks/use-tree-handlers.hook';
import classes from './tree.view.scss';

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

  // // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // const onDragEnd = (result: DropResult, provided: ResponderProvided) => {
  //   // console.log(result);
  // };
  const {
    lassoCoords: { current, start },
  } = treeState;
  return (
    <div className={classes.TreeView} tabIndex={0} {...getContainerProps()}>
      {treeState.lassoActive && current !== null && start !== null && (
        <div
          className={classes.Lasso}
          style={{
            top: Math.min(start, current),
            height: current > start ? current - start : start - current,
          }}
        />
      )}
      <DragDropContext onDragEnd={() => {}}>
        <NodeView node={treeState.tree} />
      </DragDropContext>
    </div>
  );
}

export default TreeView;
