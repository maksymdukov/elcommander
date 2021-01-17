import { createAction } from '@reduxjs/toolkit';
import { AppThunk } from '../../../store';
import { moveCursorThunk, setCursoredAction } from './tree-cursor.action';
import { ScrollRef } from '../../../../views/tree-view/types/scroll-ref';
import { getCursorIdx } from '../views.selectors';
import { IndexPayload } from './tree-state.actions';
import { ViewIndexPayload } from '../tree-state.interface';

type ToggleSelection = IndexPayload & ViewIndexPayload;
type SelectFromTo = IndexPayload & ViewIndexPayload;
type ResetSelection = ViewIndexPayload;
type LassoSelection = {
  start: number;
  end: number;
  direction: boolean;
} & ViewIndexPayload;
type ToggleNodeHighlight = IndexPayload & ViewIndexPayload;

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
export const toggleNodeHighlightAction = createAction<ToggleNodeHighlight>(
  'views/toggleNodeHighlight'
);

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
