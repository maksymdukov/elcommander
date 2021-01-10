import { createAction } from '@reduxjs/toolkit';
import { batch } from 'react-redux';
import { AppThunk } from '../../store';
import { LocalFs } from '../../../backends/local-fs';
import { FsItemTypeEnum } from '../../../enums/fs-item-type.enum';
import { ViewIndexPayload } from './views.slice';
import {
  getCursorIdx,
  getCursorNode,
  getNodeById,
  getNodeByIdx,
  getSelectedIds,
  getViewByIndex,
} from './views.selectors';
import { ScrollRef } from '../../../views/tree-view/types/scroll-ref';

type IndexPayload = {
  index: number;
};

type OpenDirectory = {
  nodes: {
    id: string;
    name: string;
    type: FsItemTypeEnum;
  }[];
  parentIndex: number;
  viewIndex: number;
} & ViewIndexPayload;

type CloseDirectory = IndexPayload & ViewIndexPayload;
type SetCursored = IndexPayload & ViewIndexPayload;
type ToggleSelection = IndexPayload & ViewIndexPayload;
type SelectFromTo = IndexPayload & ViewIndexPayload;
type ResetSelection = ViewIndexPayload;
type LassoSelection = {
  start: number;
  end: number;
  direction: boolean;
} & ViewIndexPayload;
type ToggleNodeHighlight = IndexPayload & ViewIndexPayload;

export const openDirectoryAction = createAction<OpenDirectory>(
  'views/openDirectory'
);
export const closeDirectoryAction = createAction<CloseDirectory>(
  'views/closeDirectory'
);
export const setCursoredAction = createAction<SetCursored>('views/setCursored');
export const toggleSelectionAction = createAction<ToggleSelection>(
  'views/toggleSelection'
);
export const selectFromToAction = createAction<SelectFromTo>(
  'views/selectFromTo'
);
export const resetSelectionAction = createAction<ResetSelection>(
  'views/resetSelection'
);
export const lassoSelectionAction = createAction<LassoSelection>(
  'views/lassoSelection'
);
export const toggleNodeHighlight = createAction<ToggleNodeHighlight>(
  'views/toggleNodeHighlight'
);

export const openDirThunk = (
  nodeIdx: number,
  viewIndex: number
): AppThunk => async (dispatch, getState) => {
  const localFs = new LocalFs();
  const node = getNodeByIdx(getState(), viewIndex, nodeIdx);
  if (node.type !== FsItemTypeEnum.Directory) {
    return;
  }
  const nodes = await localFs.readDir(node.id);
  batch(() => {
    dispatch(openDirectoryAction({ parentIndex: nodeIdx, nodes, viewIndex }));
    dispatch(setCursoredAction({ index: nodeIdx, viewIndex }));
  });
};

export const closeDirThunk = (index: number, viewIndex: number): AppThunk => (
  dispatch
) => {
  batch(() => {
    dispatch(closeDirectoryAction({ index, viewIndex }));
    dispatch(setCursoredAction({ index, viewIndex }));
  });
};

export const toggleDirByCursorThunk = (
  viewIndex: number,
  open = true
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
    dispatch(openDirThunk(cursorIdx, viewIndex));
    return;
  }

  if (!cursor!.isOpened) {
    // node is already closed
    // find parent and close it
    const treeState = getViewByIndex(state, viewIndex);
    let parentIdx: null | number = null;
    for (let i = cursorIdx; i >= 0; i -= 1) {
      const nodeId = treeState.allIds[i];
      const node = getNodeById(state, viewIndex, nodeId);
      if (node.children.includes(cursor!.id)) {
        parentIdx = i;
        break;
      }
    }

    if (parentIdx !== null) {
      dispatch(closeDirThunk(parentIdx, viewIndex));
    }
    return;
  }
  dispatch(closeDirThunk(cursorIdx, viewIndex));
};

export const moveCursorThunk = (
  down = true,
  viewIndex: number,
  scrollRef: ScrollRef
): AppThunk => (dispatch, getState) => {
  const treeState = getViewByIndex(getState(), viewIndex);
  let index = 0;
  // no current cursor ? - set to the first
  if (treeState.cursor === null && !treeState.allIds.length) {
    return;
  }
  // going down
  if (down && treeState.cursor !== null) {
    index = Math.min(treeState.cursor + 1, treeState.allIds.length - 1);
  }
  // going up
  if (!down && treeState.cursor !== null) {
    index = Math.max(treeState.cursor - 1, 0);
  }

  dispatch(
    setCursoredAction({
      viewIndex,
      index,
    })
  );
  scrollRef.current?.scrollToItem(index, 'auto');
};

export const selectAndMoveCursorThunk = (
  viewIndex: number,
  scrollRef: ScrollRef,
  down = true
): AppThunk => (dispatch, getState) => {
  const state = getState();
  const cursorIdx = getCursorIdx(state, viewIndex);
  if (cursorIdx === null) {
    return;
  }
  dispatch(moveCursorThunk(down, viewIndex, scrollRef));
  dispatch(toggleSelectionAction({ viewIndex, index: cursorIdx }));
};

export const selectFromToThunk = (
  toIndex: number,
  viewIndex: number
): AppThunk => (dispatch) => {
  dispatch(selectFromToAction({ index: toIndex, viewIndex }));
  dispatch(setCursoredAction({ viewIndex, index: toIndex }));
};

export const setItemCursoredByClick = (
  index: number,
  viewIndex: number
): AppThunk => (dispatch, getState) => {
  dispatch(setCursoredAction({ viewIndex, index }));
  const selectedIds = getSelectedIds(getState(), viewIndex);
  if (selectedIds.size) {
    dispatch(resetSelectionAction({ viewIndex }));
  }
};
