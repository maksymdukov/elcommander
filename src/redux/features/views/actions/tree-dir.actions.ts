import { createAction } from '@reduxjs/toolkit';
import { batch } from 'react-redux';
import { FSBackend } from '../../../../backends/interfaces/fs-backend.interface';
import { AppThunk } from '../../../store';
import {
  getAllIdxByIndex,
  getCursorIdx,
  getCursorNode,
  getNodeByIdx,
  getStartPath,
} from '../views.selectors';
import { OPENABLE_NODE_TYPES } from '../../../../views/tree-view/tree-view.constants';
import { IndexPayload } from './tree-state.actions';
import { setCursoredAction } from './tree-cursor.action';
import { ViewStatePayload } from '../tree-state.interface';
import { IFSNode } from '../../../../backends/interfaces/fs-item.interface';
import { DirectoryStateUtils } from '../utils/directory-state.utils';

type OpenDirectory = ViewStatePayload<{
  nodes: IFSNode[];
  parentIndex: number;
}>;

type CloseDirectory = ViewStatePayload<IndexPayload>;
type EnterDirectoryAction = ViewStatePayload<
  IndexPayload & { nodes: IFSNode[] }
>;
type EnterDirectoryByPathAction = ViewStatePayload<{
  nodes: IFSNode[];
  path: string;
}>;
type ExitDirectoryByPath = ViewStatePayload<{
  nodes: IFSNode[];
  parentPath: string;
}>;

export const openDirectoryAction = createAction<OpenDirectory>(
  'views/openDirectory'
);
export const closeDirectoryAction = createAction<CloseDirectory>(
  'views/closeDirectory'
);
export const enterDirectoryAction = createAction<EnterDirectoryAction>(
  'views/enterDirectory'
);
export const enterDirectoryByPathAction = createAction<
  EnterDirectoryByPathAction
>('views/enterDirectoryByPath');
export const exitDirectoryAction = createAction<ExitDirectoryByPath>(
  'views/exitDirectory'
);

export const openDirThunk = (
  nodeIdx: number,
  viewIndex: number,
  fsManager: FSBackend
): AppThunk => async (dispatch, getState) => {
  const node = getNodeByIdx(getState(), viewIndex, nodeIdx);
  if (!OPENABLE_NODE_TYPES.includes(node.type)) {
    return;
  }
  fsManager.readWatchDir(node.id).on('dirRead', (nodes) => {
    batch(() => {
      dispatch(openDirectoryAction({ parentIndex: nodeIdx, nodes, viewIndex }));
      dispatch(setCursoredAction({ index: nodeIdx, viewIndex }));
    });
  });
};

export const closeDirThunk = (
  index: number,
  viewIndex: number,
  fnManager: FSBackend
): AppThunk => (dispatch, getState) => {
  const node = getNodeByIdx(getState(), viewIndex, index);
  // unsubscribe from other prev watched dirs recursively
  fnManager.unwatchDir(node.id);
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
    const allIds = getAllIdxByIndex(state, viewIndex);
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
  nodeIndex: number,
  viewIndex: number,
  fsManager: FSBackend
): AppThunk => async (dispatch, getState) => {
  const targetNode = getNodeByIdx(getState(), viewIndex, nodeIndex);
  // unsubscribe from any other prev watched dirs
  fsManager.unwatchAllDir();

  fsManager
    .readWatchDir(targetNode.id)
    .on('dirRead', (nodes) => {
      dispatch(enterDirectoryAction({ nodes, viewIndex, index: nodeIndex }));
    })
    .on('change', (eventType, filename) => {
      console.log(eventType, 'eventType');
      console.log(filename, 'filename');
    })
    .on('error', (error) => {
      console.dir(error);
    });
};

export const enterDirByPathThunk = (
  path = '/',
  viewIndex: number,
  fsManager: FSBackend
): AppThunk => async (dispatch) => {
  // const nodes = await fsManager.readDir(path);
  // unsubscribe from any other prev watched dirs
  fsManager.unwatchAllDir();

  // dispatch('loadingStartPath')
  fsManager
    .readWatchDir(path)
    .on('dirRead', (nodes) => {
      dispatch(enterDirectoryByPathAction({ path, nodes, viewIndex }));
    })
    .on('change', (eventType, filename) => {
      console.log(eventType, 'eventType');
      console.log(filename, 'filename');
    })
    .on('error', (error) => {
      console.dir(error);
    });
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
  dispatch(enterDirThunk(cursorIdx, viewIndex, fsManager));
};

export const exitDirThunk = (
  viewIndex: number,
  fsManager: FSBackend
): AppThunk => async (dispatch, getState) => {
  const state = getState();
  const currentPath = getStartPath(state, viewIndex);
  if (currentPath === '/') {
    // can't go higher
    return;
  }
  const parentPath = DirectoryStateUtils.getParentPath(currentPath);
  // unwatchAll from all other prev watched dirs
  fsManager.unwatchAllDir();

  fsManager.readWatchDir(parentPath).on('dirRead', (nodes) => {
    dispatch(exitDirectoryAction({ nodes, viewIndex, parentPath }));
  });
};
