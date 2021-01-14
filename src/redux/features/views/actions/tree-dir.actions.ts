import { createAction } from '@reduxjs/toolkit';
import { batch } from 'react-redux';
import { FSBackend } from '../../../../backends/abstracts/fs-backend.abstract';
import { AppThunk } from '../../../store';
import {
  getAllPathByIndex,
  getCursorIdx,
  getCursorNode,
  getEnterStack,
  getNodeByIdx,
  getNodeByPath,
  getStartPath,
} from '../views.selectors';
import { OPENABLE_NODE_TYPES } from '../../../../views/tree-view/tree-view.constants';
import { IndexPayload } from './tree-state.actions';
import { setCursoredAction } from './tree-cursor.action';
import { ViewIndexPayload, ViewStatePayload } from '../tree-state.interface';
import { DirectoryStateUtils } from '../utils/directory-state.utils';
import { IFSRawNode } from '../../../../backends/interfaces/fs-raw-node.interface';
import { TreeNode } from '../../../../interfaces/node.interface';

type OpenDirectory = ViewStatePayload<{
  nodes: IFSRawNode[];
  parentIndex: number;
}>;

type CloseDirectory = ViewStatePayload<IndexPayload>;
type EnterDirectoryAction = ViewStatePayload<{
  nodes: IFSRawNode[];
  path: string;
  cursorPath?: string;
}>;
type ReadWatchDirThunk = (arg: {
  node?: TreeNode;
  path: string;
  enterStack?: TreeNode[];
  fsManager: FSBackend;
  onDirRead: (nodes: IFSRawNode[]) => void;
  onChange: (eventType: string, filename: string | Buffer) => void;
  onError: (error: Error) => void;
}) => AppThunk;
type EnterDirectoryFail = ViewStatePayload<{
  error: string;
}>;
type EnterDirectoryStartAction = ViewStatePayload<{ path?: string }>;

export const openDirectoryAction = createAction<OpenDirectory>(
  'views/openDirectory'
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
  path,
  fsManager,
  onDirRead,
  enterStack,
  onChange,
  onError,
}): AppThunk => () => {
  fsManager
    .readWatchDir(node, path, enterStack)
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
  dispatch(
    readWatchDirThunk({
      fsManager,
      node,
      path: node.path,
      onDirRead: (nodes) => {
        batch(() => {
          dispatch(
            openDirectoryAction({ parentIndex: nodeIdx, nodes, viewIndex })
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
  nodePath: string,
  viewIndex: number,
  fsManager: FSBackend,
  cursorPath?: string
): AppThunk => async (dispatch, getState) => {
  const targetNode = getNodeByPath(getState(), viewIndex, nodePath);
  // unsubscribe from any other prev watched dirs
  fsManager.unwatchAllDir();

  dispatch(enterDirectoryStartAction({ viewIndex, path: targetNode.path }));

  dispatch(
    readWatchDirThunk({
      fsManager,
      node: targetNode,
      path: nodePath,
      onDirRead: (nodes) => {
        dispatch(
          enterDirectorySuccessAction({
            nodes,
            viewIndex,
            path: nodePath,
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
  dispatch(enterDirThunk(targetNode.path, viewIndex, fsManager));
};

export const enterDirByPathThunk = (
  path = '/',
  viewIndex: number,
  fsManager: FSBackend,
  cursorPath?: string
): AppThunk => async (dispatch) => {
  // unsubscribe from any other prev watched dirs
  fsManager.unwatchAllDir();
  batch(() => {
    dispatch(resetEnterStackAction({ viewIndex }));
    dispatch(enterDirectoryStartAction({ viewIndex }));
  });

  dispatch(
    readWatchDirThunk({
      path,
      fsManager,
      onDirRead: (nodes) => {
        dispatch(
          enterDirectorySuccessAction({ path, nodes, viewIndex, cursorPath })
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

  // dispatch('loadingStartPath')
};

export const initializeViewThunk = (
  viewIndex: number,
  fsManager: FSBackend
): AppThunk => async (dispatch) => {
  dispatch(enterDirByPathThunk(undefined, viewIndex, fsManager));
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
  dispatch(enterDirThunk(cursor.path, viewIndex, fsManager));
};

export const exitDirThunk = (
  viewIndex: number,
  fsManager: FSBackend
): AppThunk => async (dispatch, getState) => {
  const state = getState();
  const currentPath = getStartPath(state, viewIndex);
  const enterStack = getEnterStack(state, viewIndex);
  if (currentPath === '/') {
    // can't go higher
    return;
  }
  const parentPath = DirectoryStateUtils.getParentPath(currentPath);
  fsManager.unwatchAllDir();
  dispatch(exitDirectoryAction({ viewIndex }));
  dispatch(enterDirectoryStartAction({ viewIndex }));
  dispatch(
    readWatchDirThunk({
      fsManager,
      path: parentPath,
      enterStack,
      onDirRead: (nodes) => {
        dispatch(
          enterDirectorySuccessAction({
            nodes,
            viewIndex,
            path: parentPath,
            cursorPath: currentPath,
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
