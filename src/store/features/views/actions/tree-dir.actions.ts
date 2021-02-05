import { createAction } from '@reduxjs/toolkit';
import { batch } from 'react-redux';
import {
  IFSRawNode,
  TreeNode,
  splitByDelimiter,
  FsPlugin,
} from 'elcommander-plugin-sdk';
import { AppThunk } from 'store/store';
import { OPENABLE_NODE_TYPES } from 'views/tree-view/tree-view.constants';
import {
  getAllPathByIndex,
  getCursorIdx,
  getCursorNode,
  getNodeByIdx,
  getNodeById,
  getStartNode,
} from '../views.selectors';
import { IndexPayload } from './tree-state.actions';
import { setCursoredAction } from './tree-cursor.action';
import { ViewIndexPayload, ViewStatePayload } from '../tree-state.interface';
import { DirectoryStateUtils } from '../utils/directory-state.utils';

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
  fsPlugin: FsPlugin;
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
  fsPlugin,
  onDirRead,
  onChange,
  onError,
}): AppThunk => () => {
  fsPlugin.fs
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
  fsPlugin: FsPlugin
): AppThunk => async (dispatch, getState) => {
  const node = getNodeByIdx(getState(), viewIndex, nodeIdx);
  if (!OPENABLE_NODE_TYPES.includes(node.type)) {
    return;
  }
  dispatch(openDirectoryStartAction({ viewIndex, index: nodeIdx }));
  dispatch(
    readWatchDirThunk({
      fsPlugin,
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
  fsPlugin: FsPlugin
): AppThunk => (dispatch, getState) => {
  const node = getNodeByIdx(getState(), viewIndex, index);
  // unsubscribe from other prev watched dirs recursively
  fsPlugin.fs.unwatchDir(node.path);
  batch(() => {
    dispatch(closeDirectoryAction({ index, viewIndex }));
    dispatch(setCursoredAction({ index, viewIndex }));
  });
};

export const toggleDirByCursorThunk = (
  viewIndex: number,
  open = true,
  fsPlugin: FsPlugin
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
    dispatch(openDirThunk(cursorIdx, viewIndex, fsPlugin));
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
      dispatch(closeDirThunk(parentIdx, viewIndex, fsPlugin));
    }
    return;
  }
  dispatch(closeDirThunk(cursorIdx, viewIndex, fsPlugin));
};

export const enterDirThunk = (
  nodeId: string,
  viewIndex: number,
  fsPlugin: FsPlugin,
  cursorPath?: string
): AppThunk => async (dispatch, getState) => {
  const targetNode = getNodeById(getState(), viewIndex, nodeId);
  // unsubscribe from any other prev watched dirs
  fsPlugin.fs.unwatchAllDir();

  dispatch(enterDirectoryStartAction({ viewIndex, id: targetNode.id }));

  dispatch(
    readWatchDirThunk({
      fsPlugin,
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
  fsPlugin: FsPlugin
): AppThunk => (dispatch, getState) => {
  const targetNode = getNodeByIdx(getState(), viewIndex, nodeIndex);
  dispatch(enterDirThunk(targetNode.id, viewIndex, fsPlugin));
};

export const enterDirByStartNode = (
  viewIndex: number,
  fsPlugin: FsPlugin
): AppThunk => async (dispatch, getState) => {
  const startNode = getStartNode(getState(), viewIndex);
  // unsubscribe from any other prev watched dirs
  fsPlugin.fs.unwatchAllDir();
  batch(() => {
    dispatch(resetEnterStackAction({ viewIndex }));
    dispatch(enterDirectoryStartAction({ viewIndex }));
  });

  dispatch(
    readWatchDirThunk({
      node: startNode,
      fsPlugin,
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
  fsPlugin: FsPlugin
): AppThunk => async (dispatch) => {
  dispatch(enterDirByStartNode(viewIndex, fsPlugin));
};

export const enterDirByCursorThunk = (
  viewIndex: number,
  fsPlugin: FsPlugin
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
  dispatch(enterDirThunk(cursor.id, viewIndex, fsPlugin));
};

export const exitToParentThunk = (
  viewIndex: number,
  fsPlugin: FsPlugin,
  pathToExit?: string
): AppThunk => (dispatch, getState) => {
  const state = getState();
  const startNode = getStartNode(state, viewIndex);
  if (startNode.path === '/' || startNode.path === pathToExit) {
    // can't go higher
    return;
  }
  fsPlugin.fs.unwatchAllDir();
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

  for (let i = 0; i < levels; i += 1) {
    prevParentNode = parentNode;
    dispatch(exitDirectoryAction({ viewIndex }));
    // reach out to fsPlugin and ask it to return one-level-up node
    parentNode = {
      ...parentNode,
      path: DirectoryStateUtils.getParentPath(parentNode.path),
    };
    parentNode = fsPlugin.fs.getParentNode(parentNode);
  }

  dispatch(enterDirectoryStartAction({ viewIndex, startNode: parentNode }));
  dispatch(
    readWatchDirThunk({
      node: parentNode,
      up: true,
      fsPlugin,
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
