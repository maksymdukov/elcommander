import { createAction } from '@reduxjs/toolkit';
import { ScrollRef } from '../../../../views/tree-view/types/scroll-ref';
import { AppThunk } from '../../../store';
import { getSelectedPaths, getViewByIndex } from '../views.selectors';
import { IndexPayload } from './tree-state.actions';
import { resetSelectionAction } from './tree-selection.actions';
import { ViewIndexPayload } from '../tree-state.interface';

type SetCursored = IndexPayload & ViewIndexPayload;

export const setCursoredAction = createAction<SetCursored>('views/setCursored');

export const moveCursorThunk = (
  down = true,
  viewIndex: number,
  scrollRef: ScrollRef
): AppThunk => (dispatch, getState) => {
  const treeState = getViewByIndex(getState(), viewIndex);
  let index = 0;
  // no current cursor ? - set to the first
  if (treeState.cursor === null && !treeState.allPath.length) {
    return;
  }
  // going down
  if (down && treeState.cursor !== null) {
    index = Math.min(treeState.cursor + 1, treeState.allPath.length - 1);
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

export const setItemCursoredByClick = (
  index: number,
  viewIndex: number
): AppThunk => (dispatch, getState) => {
  dispatch(setCursoredAction({ viewIndex, index }));
  const selectedIds = getSelectedPaths(getState(), viewIndex);
  if (selectedIds.size) {
    dispatch(resetSelectionAction({ viewIndex }));
  }
};
