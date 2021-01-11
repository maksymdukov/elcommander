import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../../root-types';

export const getRootViewsSelector = (state: RootState) => state.views;
export const getViewsSelector = createSelector(
  getRootViewsSelector,
  (state) => state.views
);
export const getViewIds = createSelector(getRootViewsSelector, (state) =>
  state.views.map((v) => v.viewId)
);
export const getViewNames = createSelector(getRootViewsSelector, (state) =>
  state.views.map((v) => v.viewName)
);
export const getViewByIndex = createSelector(
  getViewsSelector,
  (_: RootState, index: number) => index,
  (state, index) => state[index]
);

export const getViewId = createSelector(
  getViewByIndex,
  (state) => state.viewId
);

export const getAllIdxByIndex = createSelector(
  getViewByIndex,
  (state) => state.allIds
);

export const getNodeHash = createSelector(
  getViewByIndex,
  (state) => state.byIds
);

export const getNodeById = createSelector(
  [getNodeHash, (_state, _idx, nodeId: string) => nodeId],
  (state, nodeId: string) => state[nodeId]
);

export const getNodeByIdx = createSelector(
  [getViewByIndex, (_state, _viewIndex, nodeIndex) => nodeIndex],
  (treeState, nodeIndex) => {
    const nodeId = treeState.allIds[nodeIndex];
    return treeState.byIds[nodeId];
  }
);

export const getCursorIdx = createSelector(
  getViewByIndex,
  (state) => state.cursor
);

export const getCursorNode = createSelector(
  getCursorIdx,
  getViewByIndex,
  (cursor, treeState) => {
    if (cursor === null) {
      return null;
    }
    const cursorId = treeState.allIds[cursor];
    return treeState.byIds[cursorId];
  }
);

export const getSelectedIds = createSelector(
  getViewByIndex,
  (state) => state.selectedIds
);

export const getStartPath = createSelector(
  getViewByIndex,
  (state) => state.startPath
);
