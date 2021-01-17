import { createAction } from '@reduxjs/toolkit';
import { batch } from 'react-redux';
import { FSBackend } from '../../../../backends/abstracts/fs-backend.abstract';
import { AppThunk } from '../../../store';
import {
  getAllPathByIndex,
  getCursorIdx,
  getCursorNode,
  getNodeByIdx,
  getNodeById,
  getStartNode,
} from '../views.selectors';
import { OPENABLE_NODE_TYPES } from '../../../../views/tree-view/tree-view.constants';
import { IndexPayload } from './tree-state.actions';
import { setCursoredAction } from './tree-cursor.action';
import { ViewIndexPayload, ViewStatePayload } from '../tree-state.interface';
import { IFSRawNode } from '../../../../backends/interfaces/fs-raw-node.interface';
import { TreeNode } from '../../../../interfaces/node.interface';
import { DirectoryStateUtils } from '../utils/directory-state.utils';
import { splitByDelimiter } from '../../../../utils/path';

type OpenDirectoryStart = ViewStatePayload<{
  index: number;
}>;
type OpenDirectorySuccess = ViewStatePayload<{
  nodes: IFSRawNode[];
  parentIndex: number;
}>;
type OpenDirectoryFail = ViewStatePayload<{
  index: number;
  error: string;
}>;

type CloseDirectory = ViewStatePayload<IndexPayload>;
type EnterDirectoryAction = ViewStatePayload<{
  nodes: IFSRawNode[];
  cursorPath?: string;
}>;
type ReadWatchDirThunk = (arg: {
  node: TreeNode;
  up?: boolean;
  fsManager: FSBackend;
  onDirRead: (nodes: IFSRawNode[]) => void;
  onChange: (eventType: string, filename: string | Buffer) => void;
  onError: (error: Error) => void;
}) => AppThunk;
type EnterDirectoryFail = ViewStatePayload<{
  error: string;
}>;
type EnterDirectoryStartAction = ViewStatePayload<{
  id?: string;
  startNode?: TreeNode;
}>;

export const openDirectoryStartAction = createAction<OpenDirectoryStart>(
  'views/openDirectoryStart'
);
export const openDirectorySuccessAction = createAction<OpenDirectorySuccess>(
  'views/openDirectorySuccess'
);
export const openDirectoryFailAction = createAction<OpenDirectoryFail>(
  'views/openDirectoryFail'
);
export const closeDirectoryAction = createAction<CloseDirectory>(
  'views/closeDirectory'
);
export const enterDirectoryStartAction = createAction<
  EnterDirectoryStartAction
>('views/enterDirectoryStart');
export const enterDirectorySuccessAction = createAction<EnterDirectoryAction>(
  'views/enterDirectorySuccess'
);
export const enterDirectoryFailAction = createAction<EnterDirectoryFail>(
  'views/enterDirectoryFail'
);
export const exitDirectoryAction = createAction<ViewIndexPayload>(
  'views/exitDirectory'
);
export const resetEnterStackAction = createAction<ViewIndexPayload>(
  'views/resetEnterStack'
);

export const readWatchDirThunk: ReadWatchDirThunk = ({
  node,
  up,
  fsManager,
  onDirRead,
  onChange,
  onError,
}): AppThunk => () => {
  fsManager
    .readWatchDir({ node, up })
    .on('dirRead', (nodes) => {
      onDirRead(nodes);
    })
    .on('change', (eventType, nodePath) => {
      onChange(eventType, nodePath);
    })
    .on('error', (error) => {
      onError(error);
    });
};

export const openDirThunk = (
  nodeIdx: number,
  viewIndex: number,
  fsManager: FSBackend
): AppThunk => async (dispatch, getState) => {
  const node = getNodeByIdx(getState(), viewIndex, nodeIdx);
  if (!OPENABLE_NODE_TYPES.includes(node.type)) {
    return;
  }
  dispatch(openDirectoryStartAction({ viewIndex, index: nodeIdx }));
  dispatch(
    readWatchDirThunk({
      fsManager,
      node,
      onDirRead: (nodes) => {
        batch(() => {
          dispatch(
            openDirectorySuccessAction({
              parentIndex: nodeIdx,
              nodes,
              viewIndex,
            })
          );
          dispatch(setCursoredAction({ index: nodeIdx, viewIndex }));
        });
      },
      onChange: () => {},
      onError: () => {},
    })
  );
};

export const closeDirThunk = (
  index: number,
  viewIndex: number,
  fnManager: FSBackend
): AppThunk => (dispatch, getState) => {
  const node = getNodeByIdx(getState(), viewIndex, index);
  // unsubscribe from other prev watched dirs recursively
  fnManager.unwatchDir(node);
  batch(() => {
    dispatch(closeDirectoryAction({ index, viewIndex }));
    dispatch(setCursoredAction({ index, viewIndex }));
  });
};

export const toggleDirByCursorThunk = (
  viewIndex: number,
  open = true,
  fsManager: FSBackend
): AppThunk => (dispatch, getState) => {
  const state = getState();
  const cursorIdx = getCursorIdx(state, viewIndex);
  if (cursorIdx === null) {
    return;
  }
  const cursor = getCursorNode(state, viewIndex);
  if (open) {
    if (cursor!.isOpened) {
      return;
    }
    dispatch(openDirThunk(cursorIdx, viewIndex, fsManager));
    return;
  }
  // close case
  if (!cursor!.isOpened) {
    // node is already closed
    // find parent and close it
    const allIds = getAllPathByIndex(state, viewIndex);
    let parentIdx: null | number = null;
    for (let i = cursorIdx; i >= 0; i -= 1) {
      const nodeId = allIds[i];
      if (nodeId === cursor!.parent) {
        parentIdx = i;
        break;
      }
    }

    if (parentIdx !== null) {
      dispatch(closeDirThunk(parentIdx, viewIndex, fsManager));
    }
    return;
  }
  dispatch(closeDirThunk(cursorIdx, viewIndex, fsManager));
};

export const enterDirThunk = (
  nodeId: string,
  viewIndex: number,
  fsManager: FSBackend,
  cursorPath?: string
): AppThunk => async (dispatch, getState) => {
  const targetNode = getNodeById(getState(), viewIndex, nodeId);
  // unsubscribe from any other prev watched dirs
  fsManager.unwatchAllDir();

  dispatch(enterDirectoryStartAction({ viewIndex, id: targetNode.id }));

  dispatch(
    readWatchDirThunk({
      fsManager,
      node: targetNode,
      onDirRead: (nodes) => {
        dispatch(
          enterDirectorySuccessAction({
            nodes,
            viewIndex,
            cursorPath,
          })
        );
      },
      onChange: (eventType, filename) => {
        console.log(eventType, 'eventType');
        console.log(filename, 'filename');
      },
      onError: (error) => {
        console.dir(error);
      },
    })
  );
};

export const enterDirByNodeIndex = (
  nodeIndex: number,
  viewIndex: number,
  fsManager: FSBackend
): AppThunk => (dispatch, getState) => {
  const targetNode = getNodeByIdx(getState(), viewIndex, nodeIndex);
  dispatch(enterDirThunk(targetNode.id, viewIndex, fsManager));
};

export const enterDirByStartNode = (
  viewIndex: number,
  fsManager: FSBackend
): AppThunk => async (dispatch, getState) => {
  const startNode = getStartNode(getState(), viewIndex);
  // unsubscribe from any other prev watched dirs
  fsManager.unwatchAllDir();
  batch(() => {
    dispatch(resetEnterStackAction({ viewIndex }));
    dispatch(enterDirectoryStartAction({ viewIndex }));
  });

  dispatch(
    readWatchDirThunk({
      node: startNode,
      fsManager,
      onDirRead: (nodes) => {
        dispatch(enterDirectorySuccessAction({ nodes, viewIndex }));
      },
      onChange: (eventType, filename) => {
        console.log(eventType, 'eventType');
        console.log(filename, 'filename');
      },
      onError: (error) => {
        console.dir(error);
      },
    })
  );

  // dispatch('loadingStartPath')
};

export const initializeViewThunk = (
  viewIndex: number,
  fsManager: FSBackend
): AppThunk => async (dispatch) => {
  dispatch(enterDirByStartNode(viewIndex, fsManager));
};

export const enterDirByCursorThunk = (
  viewIndex: number,
  fsManager: FSBackend
): AppThunk => (dispatch, getState) => {
  const state = getState();
  const cursorIdx = getCursorIdx(state, viewIndex);
  if (cursorIdx === null) {
    return;
  }
  const cursor = getCursorNode(state, viewIndex);
  if (cursor === null) {
    return;
  }
  if (!OPENABLE_NODE_TYPES.includes(cursor.type)) {
    return;
  }
  dispatch(enterDirThunk(cursor.id, viewIndex, fsManager));
};

export const exitToParentThunk = (
  viewIndex: number,
  fsManager: FSBackend,
  pathToExit?: string
): AppThunk => (dispatch, getState) => {
  const state = getState();
  const startNode = getStartNode(state, viewIndex);
  if (startNode.path === '/' || startNode.path === pathToExit) {
    // can't go higher
    return;
  }
  fsManager.unwatchAllDir();
  let levels = 1; // exit to direct parent by default
  if (pathToExit) {
    // figure out number of levels to exit
    // compared to our current startNode
    const pathToExitArr = splitByDelimiter(pathToExit);
    const currentPathArr = splitByDelimiter(startNode.path);
    levels = currentPathArr.length - pathToExitArr.length;
  }

  let parentNode: TreeNode = startNode;
  let prevParentNode = startNode;

  for (let i = 0; i < levels; i++) {
    prevParentNode = parentNode;
    dispatch(exitDirectoryAction({ viewIndex }));
    // reach out to fsManager and ask it to return one-level-up node
    parentNode = {
      ...parentNode,
      path: DirectoryStateUtils.getParentPath(parentNode.path),
    };
    parentNode = fsManager.getParentNode(parentNode);
  }

  dispatch(enterDirectoryStartAction({ viewIndex, startNode: parentNode }));
  dispatch(
    readWatchDirThunk({
      node: parentNode,
      up: true,
      fsManager,
      onDirRead: (nodes) => {
        dispatch(
          enterDirectorySuccessAction({
            nodes,
            viewIndex,
            cursorPath: prevParentNode.path,
          })
        );
      },
      onChange: (eventType, filename) => {
        console.log(eventType, 'eventType');
        console.log(filename, 'filename');
      },
      onError: (error) => {
        console.dir(error);
      },
    })
  );
};
